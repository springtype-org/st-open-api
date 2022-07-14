import type { request as httpRequestType } from "http";
import type { request as httpsRequestType } from "https";
import { RequestOptions, Request, Response } from './http'

// Dynamic Browser support
let httpRequest: typeof httpRequestType
let httpsRequest: typeof httpsRequestType
if (typeof window === 'undefined') {
    httpRequest = require('http').request
    httpsRequest = require('https').request
}

export const fetch = async (
    url: string | URL | Request,
    { method, headers, body, ...options }: RequestOptions = {}
): Promise<Response> => {
    const _request: Request =
        typeof url === "string" || url instanceof URL
            ? new Request(url, { method, headers, body })
            : url;

    if (!(_request instanceof Request)) {
        throw new TypeError("url must be string, URL or Request");
    }

    return new Promise((resolve, reject) => {
        const request =
            _request.url.protocol === "https:" ? httpsRequest : httpRequest;

        const req = request(
            _request.url,
            {
                method: _request.method,
                headers: _request.headers,
                ...options,
            },
            (res) => resolve(new Response(res))
        );

        req.on("error", reject);
        req.end(_request.body.length ? _request.body : undefined);
    });
};