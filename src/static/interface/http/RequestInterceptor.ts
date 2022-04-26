import { Request } from './Request';

export type RequestInterceptor = (request: Request) => Promise<Request>;
