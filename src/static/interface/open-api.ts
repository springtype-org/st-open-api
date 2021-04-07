export type ExtXMLHttpRequest = XMLHttpRequest & { resolve: Function; reject: Function; eventListener: EventListener };

export interface IQueryParam {
  name: string;
  value: any;
}

export type EventListenerProps = (evt: ProgressEvent<ExtXMLHttpRequest>) => any;

export interface EventListener {
  beforeSend?: (xhr: ExtXMLHttpRequest) => void;
  abort?: EventListenerProps;
  error?: EventListenerProps;
  load?: EventListenerProps;
  loadend?: EventListenerProps;
  loadstart?: EventListenerProps;
  progress?: EventListenerProps;
  timeout?: EventListenerProps;
}

export interface Request {
  method: string;
  url: string;
  urlParameter?: Parameter;
  queryParameter?: Array<IQueryParam>;
  header?: Parameter;
  body?: BodyInit | null;
}

export interface Error {
  status: number;
  message: string;
}

export interface QueryParam {
  name: string;
  value: any;
}

export interface Parameter {
  [name: string]: string | number | boolean;
}

export interface HttpOption {
  interceptor: RequestInterceptor;
  errorHandler: ErrorHandler;
  eventListener: EventListener;
}

export interface OpenApi {
  requestInterceptor: RequestInterceptor;
  errorHandler: ErrorHandler;
  endpointUrl: string;
}

export type RequestInterceptor = (request: Request) => Promise<Request>;
export type ErrorHandler = (request: Error) => Error | false;
