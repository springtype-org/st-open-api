import {
    IncomingHttpHeaders,
    IncomingMessage,
    request as httpRequest,
  } from 'http'
  import { request as httpsRequest } from 'https'
  import { HTTP_METHOD } from "./open-api";
  
  interface RequestOptions {
    body?: string | Buffer
    method?: HTTP_METHOD
    headers?: IncomingHttpHeaders
  }
  
  class HeadersBase {
    // the implementation is done via Proxy class
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    constructor(headers?: IncomingHttpHeaders) {}
  }
  
  const handler: ProxyHandler<HeadersBase> = {
    get(target, key: string) {
      return target[key.toLowerCase()]
    },
  
    set(target, key: string, value) {
      if (value === undefined) {
        delete target[key.toLowerCase()]
      } else {
        target[key.toLowerCase()] = value
      }
      return true
    },
  
    deleteProperty(target, key: string) {
      return delete target[key.toLowerCase()]
    },
  
    has(target, key: string) {
      return key.toLowerCase() in target
    },
  }
  
  const Headers = new Proxy(HeadersBase, {
    construct(target, [headers = {}]) {
      const res = new Proxy(new target(), handler)
  
      Object.entries(headers).forEach(([key, value]) => {
        res[key] = value
      })
  
      return res
    },
  })
  
  class Request {
    public method: HTTP_METHOD
    public headers: HeadersBase
    public body: Buffer
    public url: URL
  
    constructor(
      url: string | URL,
      { method = 'GET', headers = {}, body }: RequestOptions = {},
    ) {
      this.url = url instanceof URL ? url : new URL(url)
      this.method = method
      this.headers = new Headers(headers)
      this.body = Buffer.from(body || '')
    }
  }
  
  export class Response {
    public status: number
    public statusText: string
    public headers: HeadersBase
    public body: Promise<Buffer>
  
    constructor(public incomingMessage: IncomingMessage) {
      this.status = incomingMessage.statusCode
      this.statusText = incomingMessage.statusMessage
      this.headers = new Headers(incomingMessage.headers)
  
      this.body = new Promise((resolve, reject) => {
        const chunks = []
        incomingMessage.on('data', chunk => chunks.push(chunk))
        incomingMessage.on('aborted', () => reject(new Error('aborted')))
        incomingMessage.on('end', () => resolve(Buffer.concat(chunks)))
      })
    }
  
    async blob(): Promise<Buffer> {
      return this.body
    }
  
    async text(): Promise<string> {
      return (await this.blob()).toString('utf8')
    }
  
    async json(): Promise<any> {
      return JSON.parse(await this.text())
    }
  }
  
  export const fetch = async (
    url: string | URL | Request,
    { method, headers, body, ...options }: RequestOptions = {},
  ): Promise<Response> => {
    const _request: Request =
      typeof url === 'string' || url instanceof URL
        ? new Request(url, { method, headers, body })
        : url
  
    if (!(_request instanceof Request)) {
      throw new TypeError('url must be string, URL or Request')
    }
  
    return new Promise((resolve, reject) => {
      const request: any =
        _request.url.protocol === 'https:' ? httpsRequest : httpRequest
  
      const req = request(
        _request.url,
        {
          method: _request.method,
          headers: _request.headers,
          ...options,
        },
        res => resolve(new Response(res)),
      )
  
      req.on('error', reject)
      req.end(_request.body.length ? _request.body : undefined)
    })
  }
  