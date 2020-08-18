import {IRequest} from "../function/http";

export interface I$openApi {

    requestInterceptor: RequestInterceptor;

    endpointUrl: string;
}

export interface IParameter {
    [key: string]: string
}

export type RequestInterceptor =  (request: IRequest) => Promise<IRequest>
