import { ErrorHandler, OpenApi, Error, Request, RequestInterceptor } from '../interface/open-api';

export const DEFAULT_REQUEST_INTERCEPTOR: RequestInterceptor = async (request: Request) => request;

export const DEFAULT_ERROR_HANDLER: ErrorHandler = (error: Error) => error;

export const openApi: OpenApi = {
  requestInterceptor: DEFAULT_REQUEST_INTERCEPTOR,
  errorHandler: DEFAULT_ERROR_HANDLER,
  endpointUrl: '',
};
