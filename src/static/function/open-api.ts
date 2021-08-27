import { ErrorHandler, Error, Request, RequestInterceptor } from '../interface/open-api';

export const DEFAULT_REQUEST_INTERCEPTOR: RequestInterceptor = async (request: Request) => request;

export const DEFAULT_ERROR_HANDLER: ErrorHandler = (error: Error) => error;
