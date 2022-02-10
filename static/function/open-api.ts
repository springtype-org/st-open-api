import {ErrorHandler, I$openApi, RequestInterceptor} from "../interface/i-$-open-api";
// @ts-ignore; works well once copied over to actual generated code
import {IError, IRequest} from "./http";

export const DEFAULT_REQUEST_INTERCEPTOR: RequestInterceptor = async (request: IRequest) => {
    return request;
};

export const DEFAULT_ERROR_HANDLER: ErrorHandler = (error: IError) => {
    return error;
};

export const openApi: I$openApi = {
    requestInterceptor: DEFAULT_REQUEST_INTERCEPTOR,
    errorHandler: DEFAULT_ERROR_HANDLER,
    endpointUrl: ''
};
