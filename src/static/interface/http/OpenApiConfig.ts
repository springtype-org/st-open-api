import { RequestInterceptor } from './RequestInterceptor';
import { ErrorHandler } from './ErrorHandler';
import { SendRequest } from './SendRequest';

export interface OpenApiConfig {
  sendRequest: SendRequest;
  requestInterceptor: RequestInterceptor;
  errorHandler: ErrorHandler;
  endpointUrl: string;
}
