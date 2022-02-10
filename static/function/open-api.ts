import {ErrorHandler, HttpRequestFn, I$openApi, RequestInterceptor, ResponseInterceptor} from "../interface/i-$-open-api";
import { IQueryParam } from "./get-query-params";
// @ts-ignore; works well once copied over to actual generated code
import {IError, IRequest} from "./http";

export const DEFAULT_REQUEST_INTERCEPTOR: RequestInterceptor = async (request: IRequest) => {
    return request;
};

export const DEFAULT_RESPONSE_INTERCEPTOR: ResponseInterceptor<any> = async(request: IRequest, response: any, retry: HttpRequestFn, error?: IError) => {
    return response;
};

export const DEFAULT_ERROR_HANDLER: ErrorHandler = (error: IError) => {
    return error;
};

export const openApi: I$openApi = {
    requestInterceptor: DEFAULT_REQUEST_INTERCEPTOR,
    responseInterceptor: DEFAULT_RESPONSE_INTERCEPTOR,
    errorHandler: DEFAULT_ERROR_HANDLER,
    endpointUrl: ''
};


export type HTTP_METHOD = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export const HEADER_CONTENT_TYPE = "Content-Type"
export const HEADER_ACCEPT = "Accept"
export const HEADER_CONTENT_DISPOSITION = "Content-Disposition"

export const buildUrl = (url: string, urlParameter: IParameter = {}): string => {
    let resultUrl = url;
    for (const key of Object.keys(urlParameter)) {
        resultUrl = resultUrl.replace(`{${key}}`, encodeURIComponent(urlParameter[key]));
    }
    return resultUrl;
};

export interface IRequest {
    method: HTTP_METHOD;
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