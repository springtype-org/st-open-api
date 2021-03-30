import {getQueryParameters, IQueryParam} from "./get-query-params";
import {ErrorHandler, RequestInterceptor} from "../interface/i-$-open-api";

export const HEADER_CONTENT_TYPE = "Content-Type"
export const HEADER_ACCEPT = "Accept"
export const HEADER_CONTENT_DISPOSITION = "Content-Disposition"

export const getDispositionMap = (contentDisposition: string): { [key: string]: string } => {
    return contentDisposition.split(';').reduce((prev, curr) => {
        let [key, value = ''] = curr.trim().split('=');
        if (value.startsWith('"') && value.endsWith('"')) {
            return {...prev, [key]: value.substr(1, value.length - 2)};
        }
        return {...prev, [key]: value};
    }, {});
}


/**
 * Build url replace parameter
 * @param url
 * @param urlParameter
 */
const buildUrl = (url: string, urlParameter: IParameter = {}): string => {
    let resultUrl = url;
    for (const key of Object.keys(urlParameter)) {
        resultUrl = resultUrl.replace(`{${key}}`, encodeURIComponent(urlParameter[key]));
    }
    return resultUrl;
};

export interface IRequest {
    method: string;
    url: string;
    urlParameter?: IParameter;
    queryParameter?: Array<IQueryParam>;
    header?: IParameter;
    body?: string;
}

export interface IError {
    status: number;
    message: string;
}

export interface IParameter {
    [name: string]: string | number | boolean
}

/**
 * Make an http request
 * @param request the http request parameters
 * @param requestInterceptor an request interceptor will be called before every request call
 * @param errorHandler handles errors
 */
export const http = async (request: IRequest,
                           requestInterceptor: RequestInterceptor,
                           errorHandler: ErrorHandler): Promise<string> => {

    if (requestInterceptor) {
        request = await requestInterceptor(request);
    }

    return await new Promise((resolve, reject) => {

        // 1. Create a new XMLHttpRequest object
        const xhr = new XMLHttpRequest();

        const buildQuery = getQueryParameters(request.queryParameter);
        const url = `${buildUrl(request.url, request.urlParameter)}${buildQuery}`;

        // 2.0 Configure it: GET-request for the URL
        xhr.open(request.method, url);

        // 2.1 Set header
        if (request.header) {
            for (const headerName of Object.keys(request.header)) {
                xhr.setRequestHeader(headerName, `${request.header[headerName]}`);
            }
        }
        let isDownload = false;
        if (request.header[HEADER_ACCEPT] === 'application/octet-stream') {
            isDownload = true;
            xhr.responseType = 'blob';
        }
        // 3. Send the request over the network
        xhr.send(request.body);

        // 4. This will be called after the response is received
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 400) {
                if (isDownload) {
                    const contentType = xhr.getResponseHeader(HEADER_CONTENT_TYPE) || '';
                    const contentDisposition = xhr.getResponseHeader(HEADER_CONTENT_DISPOSITION) || '';
                    const dispositionMap = getDispositionMap(contentDisposition)

                    const blob = new Blob([xhr.response], {type: contentType});

                    const a = document.createElement('a');
                    a.setAttribute('style', 'display: none');

                    const url = window.URL.createObjectURL(blob);

                    a.href = url;
                    a.download = dispositionMap['filename'] || '';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    a.remove();
                    resolve('');
                } else {
                    const response = xhr.responseText;
                    resolve(response);
                }
            } else {
                const errorResp = errorHandler({status: xhr.status, message: xhr.responseText});
                if (!!errorResp) {
                    reject(errorResp);
                }
            }
        };

        xhr.onerror = () => {
            const errorResp = errorHandler({status: xhr.status, message: xhr.responseText});
            if (!!errorResp) {
                reject(errorResp);
            }
        }
    });
};
