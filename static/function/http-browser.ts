import { RequestInterceptor, ErrorHandler, ResponseInterceptor, HttpRequestFn } from "../interface/i-$-open-api"
import { getQueryParameters } from "./get-query-params"
import { buildUrl, HEADER_ACCEPT, HEADER_CONTENT_DISPOSITION, HEADER_CONTENT_TYPE, IRequest } from "./open-api"

export const getDispositionMap = (contentDisposition: string): { [key: string]: string } => {
    return contentDisposition.split(';').reduce((prev, curr) => {
        
        let [key, value = ''] = curr.trim().split('=');

        if (value.startsWith('"') && value.endsWith('"')) {
            // TODO: use substring() not deprecated substr()
            return {...prev, [key]: value.substr(1, value.length - 2)};
        }
        return {...prev, [key]: value};
    }, {});
}

/**
 * Make an http request
 * @param request the http request parameters
 * @param requestInterceptor an request interceptor will be called before every request call
 * @param errorHandler handles errors
 */
export const http = async (request: IRequest,
                           requestInterceptor: RequestInterceptor,
                           errorHandler: ErrorHandler,
                           responseInterceptor: ResponseInterceptor<any>): Promise<string> => {

    if (requestInterceptor) {
        request = await requestInterceptor(request);
    }

    return await new Promise((resolve, reject) => {

        (async() => {

            const run: HttpRequestFn = async(request) => {
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

                    (async() => {
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
                                if (responseInterceptor) {
                                    await responseInterceptor(request, response, run);
                                }
                                resolve(response);
                            }
                        } else {
                            const errorResp = errorHandler({status: xhr.status, message: xhr.responseText});
                            if (!!errorResp) {
                                if (responseInterceptor) {
                                    await responseInterceptor(request, null, run, errorResp);
                                }
                                reject(errorResp);
                            }
                        }
                    })()
                };

                xhr.onerror = () => {
                    (async() => {
                        const errorResp = errorHandler({status: xhr.status, message: xhr.responseText});
                        if (!!errorResp) {
                            if (responseInterceptor) {
                                await responseInterceptor(request, null, run, errorResp);
                            }
                            reject(errorResp);
                        }
                    })()
                }
            }
            await run(request);

        })()
    });
};
