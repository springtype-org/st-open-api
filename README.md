# st-open-api

`st-open-api` generates API client SDKs from an OpenAPI specification written in OpenAPI version 3.x.x.
The SDKs are generated as TypeScript or JavaScript code.

## Features

- YAML and JSON spec syntax
- JavaScript and TypeScript code generation
- Load OpenAPI spec as JSON directly from a remote endpoint (e.g. Swagger endpoint)
- Browser (`XMLHttpRequest`) and Node.js HTTP client variants
- React provider code generation
- Singleton code generation
- Class name suffixing
- Quasi-global HTTP request and response interceptor functions (useful for e.g. logging, auth, token refreshing etc.)

## Examples

Please take a look at the `examples` directory. A simple example call would be:

`npx st-open-api  -s ./examples/petstore-api.yaml -o ./examples/petstore-api-client -t`

## CLI Options
````
  -v, --version                  output the current version
  -s, --source <source>          The path or url to an open-api json file
  -o, --output <outputPath>      The path where files are generated to
  -f, --force                    Force generation also if validation fails
  -i, --interceptor              Force in service class to add an interceptor (default: false)
  -d, --debug                    Print debug messages
  -l, --language [language]      choose your language (js, jsOnly, ts) (default: "ts")
  -n, --suffix <ServiceSuffix>   the suffix for an generated service class (default: "Service")
  -r, --react                    create react provider component (default: false)
  -t, --static                   create static services (default: false)
  -y, --type                     use types instead of enumerations
  -c, --component                only build components, this flag will disable all others (default: false)
  -p, --provider                 used to set the provider from "browser" to e.g. "node" (default: "browser")
  -h, --help                     display help for command
````

### Local Development

Working on the codebase of this project requires changing the CLI/generation code and being able to test it.
Therefore, you can run `yarn watch` to let `tsc`, the TypeScript compiler run continuously, including watching 
for changes and re-compilation.

To run the program locally, call: `yarn start --` and add the CLI arguments after that, for example:

`yarn start -- -s ./examples/petstore-api.yaml -o ./examples/petstore-api-client`

### Public API

To configure and use the generated client, three simple properties can be set:

**requestInterceptor**: is called before any request; here you can manipulate every request parameter, for example add an api-token header

**responseInterceptor**: is called after any request, here you can run code to log requests, or do some token validation check and refresh a JWT token automatically
 
**endpointUrl**: add here the endpoint url that will be set in every request as a prefix to the endpoint URL defined in the OpenAPI spec

#### TypeScript/Node.js

`example-usage.ts`:
````ts

// for Node.js usage (provider Node.js)

// import the generated client service class
import { V1_SERVICE } from "./examples/unified-api-client/constant/open-api-services";
// import the quasi-global openApi object
import { openApi } from "./examples/unified-api-client/function/open-api";
// types are generated, so lets use them
import { IOffsetResponse } from "./examples/unified-api-client/interface/components/i-offset-response";

// an async IIFE for top-level-await
(async() => {
  // define the actual base endpoint URL to call
  openApi.endpointUrl = 'https://some.nice.domain'

  // actually use the generated code to call the API
  const response: Promise<IOffsetResponse> = await V1_SERVICE.createOffset({
      contactInfo: {
          city: '...',
          ...
      },
      ...
  });
  ...

})()

````

#### TypeScript/React

`ExampleUsage.tsx`:

````tsx
import React from "react";

// import the quasi-global openApi object
import { openApi } from "./examples/unified-api-client/function/open-api";
// import the generated Provider component
import { OpenApiProvider } from "./examples/unified-api-client/provider/open-api-provider";

export function OffsetApiClient() {

  // define the actual base endpoint URL to call
  openApi.endpointUrl = 'https://some.nice.domain'

  // return the provider
  return <OpenApiProvider></OpenApiProvider>
}
````

`SomeOtherComponent.tsx`:

````tsx
import React, { useContext, useState } from "react";

// import the quasi-global openApi object
import { openApi } from "./examples/unified-api-client/function/open-api";
// import the generated Provider component
import { OpenApiProvider } from "./examples/unified-api-client/provider/open-api-provider";

export function SomeOtherComponent() {

  const offsetApi = useContext(OpenApiProvider)
  const [offsetResonse, setOffsetResponse] = useState<IOffsetResponse>({})
 
 useEffect(() => {
   (async() => {

  // actually use the generated code to call the API
    const response: Promise<IOffsetResponse> = await offsetApi.createOffset({
        contactInfo: {
            city: '...',
            ...
        },
        ...
    });

    setOffsetResponse(response)

   })()
 })

 return <div>Offset response: {JSON.stringify(offsetResonse, null, 2)}</div>
}
````

#### Request Interceptor

You can customize request data using the `async requestInterceptor(request: IRequest)` callback function:

````ts
// this can be useful for Authorization using JWT tokens or other use-cases
// requestInterceptor is called before the actual HTTP request is sent to the server
openApi.requestInterceptor = async(request: IRequest) => {

    console.log('requestInterceptor called with request', request)

    // e.g. set a token to be used by all requests
    request.header['Authorization'] = `Bearer ${SOME_JWT_TOKEN}`

    // e.g. add some custom headers to any request or filter using logic based on request object
    request.header['X-Forwarded-For'] = '...'

    return request
}
````

#### Response Interceptor

When a response is returned, you might want to do addtional tasks; in debug mode
it might be helpful to log in general; in error cases, it might be helpful to
put a general purpose retry logic -- sometimes you might want to refresh the
JWT token automatically (exchange long term token with a short-term token): 


````ts
let retryCount = 0;

// responseInterceptor is called before the response is resolve()'d
// is is called for non-error and error cases (that's why error is optional)
openApi.responseInterceptor = async(
  request: IRequest, response: Response, http: HttpRequestFn, error?: IError
) => {

    // the retry() function is a reference to the function that has been called
    // internally to run the request. The request object contains all parameters
    // so we can mutate them if necessary, and rety.

    console.log('responseInterceptor called with', request, response, retry, error)

    retryCount++;
    
    request.header['X-Retry-Count'] = retryCount

    if (error && retryCount <= 3) {
        await retry(request)
    }

    // this method is async and awaited in outer scope.
    // you can run more requests here just by using the retry() function reference
    // as long as it is awaited
}
````

#### Error handler

The error handler is meant to be implemented for general error handling.
It is called if the HTTP status is not between 200 and 399 or in any case
of a JavaScript runtime error while executing the HTTP request.

If the error handler is implemented, it must return the error object
provided, else the internal implementation will mask and ignore the error.

````ts
// errorHandler is called before the responseInterceptor is invoked
// is can be used to filter and mask errors by returning false
openApi.errorHandler = (error: IError) => {

    console.log('errorHandler called with error', error)

    // e.g. do tracing here

    return error;
}
````

## Roadmap
- add suffix for enumerations and add a get values list 
- naming strategy hook function (service naming from path)
- generate end-2-end integration tests for each client (usage examples)
- support for a config file to set all the options
- add support to different HTTP client libraries
- runtime typechecks for request and reponse
- add support other target languages
  - Java
  - PHP
  - Go
  - .NET