import { RequestInterceptor } from './RequestInterceptor';
import { ErrorHandler } from './ErrorHandler';

export interface RequestOption {
  requestInterceptor?: RequestInterceptor;
  errorHandler?: ErrorHandler;
  registerEventListener?: (eventName: string, fn: (evt: any, ...other: any) => void) => void;
}
