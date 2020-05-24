import {getQueryParameters, IQueryParam} from "./get-query-params";

const buildUrl = (url: string,
                  urlParameter: IParameter): string => {
    let resultUrl = url;
    for (const key of Object.keys(urlParameter)) {
        resultUrl = resultUrl.replace(`{${key}}`, encodeURI(urlParameter[key]));
    }
    return resultUrl;
}

export interface IRequest {
    method: string;
    url: string;
    urlParameter?: IParameter;
    queryParameter?: Array<IQueryParam>;
    header?: IParameter;
    body?: string;
}

export interface IParameter {
    [name: string]: string
}

export const http = async (request: IRequest,
                           requestInterceptor: (request: IRequest
                           ) => Promise<IRequest>): Promise<string> => {

    if (requestInterceptor) {
        request = await requestInterceptor(request);
    }
    return new Promise((resolve, reject) => {

        // 1. Create a new XMLHttpRequest object
        const xhr = new XMLHttpRequest();

        const buildQuery = getQueryParameters(request.queryParameter)

        // 2.0 Configure it: GET-request for the URL
        xhr.open(request.method, `${buildUrl(request.url, request.urlParameter)}${buildQuery}`);


        // 2.1 Set header
        for (const headerName of Object.keys(request.header)) {
            xhr.setRequestHeader(headerName, request.header[headerName]);
        }

        // 3. Send the request over the network
        if (request.body) {
            xhr.send(request.body);
        }

        // 4. This will be called after the response is received
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status <= 400) {
                const response = xhr.responseText;
                resolve(response);
            } else {
                reject({status: xhr.status, message: xhr.responseText});
            }
        };

        xhr.onerror = () => {
            reject({status: xhr.status, message: xhr.responseText});
        }
    });
};


