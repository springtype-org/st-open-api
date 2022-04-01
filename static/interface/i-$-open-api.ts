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

export type InterceptorContext = {}

export type RequestInterceptor =  (request: IRequest, context: InterceptorContext) => Promise<IRequest>;
export type ResponseInterceptor<R> =  (request: IRequest, response: R | undefined, retry: HttpRequestFn, context: InterceptorContext, error?: unknown) => Promise<string>;
export type HttpRequestFn = (request: IRequest) => Promise<string>;
export type ErrorHandler =  (request: IError) => IError | false;
