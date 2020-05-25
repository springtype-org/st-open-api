import {I$openApi, RequestInterceptor} from "../interface/i-$-open-api";
import {IRequest} from "./http";

const HTTP_KEY = "$openApi";

// scoped local global storage reference
const _globalThis: any = new Function("return this")();

// makes sure the global storage is not re-initialized
// and overwritten on subsequent calls / file imports
if (!_globalThis[HTTP_KEY]) {

    // register scoped global as an instance of this class
    _globalThis[HTTP_KEY] = {
    };
}

export const globalThis: any = _globalThis;
export const openApi: I$openApi = _globalThis[HTTP_KEY];

export const DEFAULT_REQUEST_INTERCEPTOR: RequestInterceptor = async (request: IRequest) => {
    return request;
};

if (!openApi.globalThis) {
    openApi.globalThis = globalThis;
}

if (!openApi.requestInterceptor) {
    openApi.requestInterceptor = DEFAULT_REQUEST_INTERCEPTOR;
}

if (!openApi.endpointUrl) {
    openApi.endpointUrl = '';
}