import {
  ErrorHandler,
  EventListener,
  EventListenerProps,
  ExtXMLHttpRequest,
  Parameter,
  QueryParam,
  Request,
  RequestInterceptor,
} from '../interface/open-api';
import { openApi } from './open-api';

export const EMPTY_STRING = '';
export const HEADER_CONTENT_TYPE = 'Content-Type';
export const HEADER_CONTENT_DISPOSITION = 'Content-Disposition';

const getQueryParameter = (paramName: string, paramValue: string) =>
  `${encodeURIComponent(paramName)}=${encodeURIComponent(paramValue)}`;

/**
 * Build the query
 * @param parameters
 */
export const getQueryParameters = (parameters: Array<QueryParam> = []): string => {
  const keyValue: Array<string> = [];
  for (const parameter of parameters) {
    if (typeof parameter.value !== 'undefined') {
      if (Array.isArray(parameter.value)) {
        parameter.value.forEach((v) => keyValue.push(getQueryParameter(parameter.name, v)));
      } else {
        keyValue.push(getQueryParameter(parameter.name, parameter.value));
      }
    }
  }
  if (keyValue.length === 0) {
    return EMPTY_STRING;
  }
  return `?${keyValue.join('&')}`;
};

export const convertRequestToFormData = (
  request: any,
  formData: FormData = new FormData(),
  prefix: string = '',
): FormData => {
  Object.entries(request).forEach((entry) => {
    const [key, value] = entry;
    const newKeyPrefix = `${prefix}${key}`;
    if (Array.isArray(value)) {
      value.forEach((arrValue) => convertRequestToFormData(arrValue, formData, `${newKeyPrefix}[]`));
    } else if (typeof value === 'object' && !(value instanceof File)) {
      convertRequestToFormData(value, formData, newKeyPrefix);
    } else if (typeof value === 'boolean') {
      formData.append(newKeyPrefix, value ? '1' : '0');
    } else {
      formData.append(newKeyPrefix, value as any);
    }
  });
  return formData;
};

export const getDispositionMap = (contentDisposition: string): { [key: string]: string } =>
  contentDisposition.split(';').reduce((prev, curr) => {
    const [key, value = ''] = curr.trim().split('=');
    if (value.startsWith('"') && value.endsWith('"')) {
      return { ...prev, [key]: value.substr(1, value.length - 2) };
    }
    return { ...prev, [key]: value };
  }, {});

/**
 * Build url replace parameter
 * @param url
 * @param urlParameter
 */
const buildUrl = (url: string, urlParameter: Parameter = {}): string => {
  let resultUrl = url;
  for (const key of Object.keys(urlParameter)) {
    resultUrl = resultUrl.replace(`{${key}}`, encodeURIComponent(urlParameter[key]));
  }
  return resultUrl;
};

export const onError = (errorHandler: ErrorHandler) => (evt: ProgressEvent<ExtXMLHttpRequest>) => {
  const xhr = evt.target as ExtXMLHttpRequest;
  const errorMessage = xhr.responseType === 'text' || xhr.responseType === '';
  const errorResp = errorHandler({ status: xhr.status, message: errorMessage ? xhr.responseText : '' });
  if (errorResp) {
    xhr.reject(errorResp);
  }
};

export const onPlainTextLoad = (evt: ProgressEvent<ExtXMLHttpRequest>) => {
  const xhr = evt.target as ExtXMLHttpRequest;
  if (xhr.status >= 200 && xhr.status < 400) {
    xhr.resolve(xhr.responseText);
  } else if (xhr.eventListener.error) {
    xhr.eventListener.error(evt);
  }
};

export const abort = (evt: ProgressEvent<ExtXMLHttpRequest>) => {
  evt.target?.reject();
};

export const onLoad = (evt: ProgressEvent<ExtXMLHttpRequest>) => {
  const xhr = evt.target as ExtXMLHttpRequest;
  if (xhr.status >= 200 && xhr.status < 400) {
    xhr.resolve();
  } else if (xhr.eventListener.error) {
    xhr.eventListener.error(evt);
  }
};

export const onJsonLoad = (evt: ProgressEvent<ExtXMLHttpRequest>) => {
  const xhr = evt.target as ExtXMLHttpRequest;

  if (xhr.status >= 200 && xhr.status < 400) {
    xhr.resolve(JSON.parse(xhr.responseText));
  } else if (xhr.eventListener.error) {
    xhr.eventListener.error(evt);
  }
};

export const onBinaryBeforeSend = (xhr: ExtXMLHttpRequest) => {
  xhr.responseType = 'blob';
};

export const onBinaryLoad = (evt: ProgressEvent<ExtXMLHttpRequest>) => {
  const xhr = evt.target as ExtXMLHttpRequest;

  if (xhr.status >= 200 && xhr.status < 400) {
    const contentType = xhr.getResponseHeader(HEADER_CONTENT_TYPE) || '';
    const contentDisposition = xhr.getResponseHeader(HEADER_CONTENT_DISPOSITION) || '';
    const dispositionMap = getDispositionMap(contentDisposition);

    const blob = new Blob([xhr.response], { type: contentType });
    const fileName = dispositionMap.filename || ''

    if ((window as any).navigator && (window as any).navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, fileName);
    } else {

      const a = document.createElement('a');
      a.setAttribute('style', 'display: none');

      const url = window.URL.createObjectURL(blob);

      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    }

  } else if (xhr.eventListener.error) {
    xhr.eventListener.error(evt);
  }
};

/**
 * Make an http request
 * @param request the http request parameters
 * @param interceptor an request interceptor will be called before every request call
 * @param errorHandler handles errors
 * @param eventListener to handle response parsing
 */
export const http = async <T>(
  request: Request,
  interceptor: RequestInterceptor = openApi.requestInterceptor,
  errorHandler: ErrorHandler = openApi.errorHandler,
  eventListener: EventListener = {},
): Promise<T> => {
  if (interceptor) {
    request = await interceptor(request);
  }

  return new Promise((resolve, reject) => {
    // 1. Create a new XMLHttpRequest object
    const xhr = new XMLHttpRequest();

    const buildQuery = getQueryParameters(request.queryParameter);
    const url = `${buildUrl(request.url, request.urlParameter)}${buildQuery}`;

    // 2.0 Configure it: GET-request for the URL
    xhr.open(request.method, url);

    // 2.1 Set header
    if (request.header) {
      // eslint-disable-next-line no-restricted-syntax
      for (const headerName of Object.keys(request.header)) {
        xhr.setRequestHeader(headerName, `${request.header[headerName]}`);
      }
    }

    // 3.1 Check if default event listener is registered
    const isErrorListener = !!Object.keys(eventListener).find((k) => k === 'error');
    const isLoadListener = !!Object.keys(eventListener).find((k) => k === 'load');
    const isAbortListener = !!Object.keys(eventListener).find((k) => k === 'abort');

    if (!isErrorListener) {
      eventListener.error = onError(errorHandler);
    }

    if (!isLoadListener) {
      eventListener.load = onLoad;
    }

    if (!isAbortListener) {
      eventListener.abort = abort;
    }

    (xhr as any).resolve = resolve;
    (xhr as any).reject = reject;
    (xhr as any).eventListener = eventListener;

    // 3. Register all event listener
    for (const keyValuePair of Object.entries(eventListener)) {
      const [key, event]: [string, EventListenerProps] = keyValuePair;
      if (key !== 'beforeSend') {
        xhr.addEventListener(key as any, event);
      }
    }

    if (eventListener.beforeSend) {
      eventListener.beforeSend(xhr as ExtXMLHttpRequest);
    }

    // 4. Send the request over the network
    xhr.send(request.body);
  });
};
