import {I$openApi, RequestInterceptor} from "../interface/i-$-open-api";
import {IRequest} from "./http";

export const DEFAULT_REQUEST_INTERCEPTOR: RequestInterceptor = async (request: IRequest) => {
    return request;
};

export const openApi: I$openApi = {
    requestInterceptor: DEFAULT_REQUEST_INTERCEPTOR,
    endpointUrl: ''
};

