import type {
    IncomingHttpHeaders,
    IncomingMessage,
} from "http";
import {
    RequestInterceptor,
    ErrorHandler,
    ResponseInterceptor,
    HttpRequestFn,
} from "../interface/i-$-open-api";
import { getQueryParameters } from "./get-query-params";
import { buildUrl, HTTP_METHOD, IRequest } from "./open-api";
import type { fetch as nodeFetchType } from './fetch-node'

export const http = async (
    request: IRequest,
    requestInterceptor: RequestInterceptor,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    errorHandler: ErrorHandler,
    responseInterceptor: ResponseInterceptor<Response | globalThis.Response>
): Promise<string> => {
    const fetch = typeof window !== 'undefined' && window.fetch ? window.fetch : (require('./fetch-node').fetch as typeof nodeFetchType) // Dynamic browser support
    const context = {};

    if (requestInterceptor) {
        request = await requestInterceptor(request, context);
    }

    const run: HttpRequestFn = async (request) => {
        const queryParams = getQueryParameters(request.queryParameter);
        const url = `${buildUrl(
            request.url,
            request.urlParameter
        )}${queryParams}`;

        try {
            const response = await fetch(url, {
                method: request.method,
                headers: request.header as Record<string, string>,
                body: request.body,
            });
            if (responseInterceptor) {
                return responseInterceptor(request, response, run, context);
            } else {
                return response.text();
            }
        } catch (e) {
            return responseInterceptor(request, undefined, run, context, e);
        }
    };

    return run(request);
};

export interface RequestOptions {
    body?: string | Buffer;
    method?: HTTP_METHOD;
    headers?: IncomingHttpHeaders;
}

class HeadersBase {
    [name: string]: string;
    constructor(headers?: IncomingHttpHeaders) {}
}

const handler: ProxyHandler<HeadersBase> = {
    get(target, key: string) {
        return target[key.toLowerCase()];
    },

    set(target, key: string, value) {
        if (value === undefined) {
            delete target[key.toLowerCase()];
        } else {
            target[key.toLowerCase()] = value;
        }
        return true;
    },

    deleteProperty(target, key: string) {
        return delete target[key.toLowerCase()];
    },

    has(target, key: string) {
        return key.toLowerCase() in target;
    },
};

export const Headers = new Proxy(HeadersBase, {
    construct(target, [headers = {}]: [{ [key: string]: string }]) {
        const res = new Proxy(new target(), handler);

        Object.entries(headers).forEach(([key, value]) => {
            res[key] = value;
        });

        return res;
    },
});

export class Request {
    public method: HTTP_METHOD;
    public headers: HeadersBase;
    public body: Buffer;
    public url: URL;

    constructor(
        url: string | URL,
        { method = "GET", headers = {}, body }: RequestOptions = {}
    ) {
        this.url = url instanceof URL ? url : new URL(url);
        this.method = method;
        this.headers = new Headers(headers);
        this.body = Buffer.from(body || "");
    }
}

export class Response {
    public status: number;
    public statusText: string;
    public headers: HeadersBase;
    public body: Promise<Buffer>;

    constructor(public incomingMessage: IncomingMessage) {
        this.status = incomingMessage.statusCode || 0;
        this.statusText = incomingMessage.statusMessage || "";
        this.headers = new Headers(incomingMessage.headers);

        this.body = new Promise((resolve, reject) => {
            const chunks: Array<Buffer> = [];
            incomingMessage.on("data", (chunk) => chunks.push(chunk));
            incomingMessage.on("aborted", () => reject(new Error("aborted")));
            incomingMessage.on("end", () => resolve(Buffer.concat(chunks)));
        });
    }

    async blob(): Promise<Buffer> {
        return this.body;
    }

    async text(): Promise<string> {
        return (await this.blob()).toString("utf8");
    }
}
