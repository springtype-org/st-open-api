// @ts-ignore; works well once copied over to actual generated code
import {IError, IRequest} from "../function/http";
export interface I$openApi {
    requestInterceptor: RequestInterceptor;
    responseInterceptor: ResponseInterceptor<any>;
    errorHandler: ErrorHandler;
    endpointUrl: string;
}

export interface IParameter {
    [key: string]: string
}

export type RequestInterceptor =  (request: IRequest) => Promise<IRequest>;
export type ResponseInterceptor<R> =  (request: IRequest, response: R, retry: HttpRequestFn, error?: IError) => Promise<R>;
export type HttpRequestFn = (request: IRequest) => Promise<void>;
export type ErrorHandler =  (request: IError) => IError | false;
