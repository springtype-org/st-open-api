import {getQueryParameters, IQueryParam} from "./get-query-params";
import {ErrorHandler, RequestInterceptor} from "../interface/i-$-open-api";

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

        // 3. Send the request over the network
        xhr.send(request.body);

        // 4. This will be called after the response is received
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 400) {
                const response = xhr.responseText;
                resolve(response);
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
