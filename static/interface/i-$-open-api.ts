import {IRequest} from "../function/http";

export interface I$openApi {
    // --- platform global reference
    // node: global, browser: window
    globalThis: any;

    requestInterceptor: RequestInterceptor;

    endpointUrl: string;
}

export interface IParameter {
    [key: string]: string
}

export type RequestInterceptor =  (request: IRequest) => Promise<IRequest>