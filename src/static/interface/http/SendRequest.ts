import { RequestOption } from './RequestOption';

export type SendRequest = <Response = void>(request: Request, options?: RequestOption) => Promise<Response>;
