# st-open-api

this api create a client for open api specification version 3.0.x

usage:
`npx st-open-api -s open-api.json -o client`

## options
-s **source** _required_ the path or url to open-api as JSON

-o **output** _required_ the output path existing files will be overridden

-f **force** _optional_  ignore result of validation: default _false_

-d **debug** _optional_  output debug information: default _false_

-l **language** _optional_ choose your output language (ts|js|onlyJs): default _ts_

-n **serviceSuffix** _optional_ choose your service suffix: default _Service_

### Configuration

configure the global _openApi_ can be manipulate some variables and every request.
`Right now not bound to window object`
 
**requestInterceptor**: is called before any request is done, here you can manipulate every request, for example add an api-token header.
 
**endpointUrl**: add here the endpoint url that will be set in every request as prefix.

## Examples

Setting a specific endpoint url global or a request interceptor

`openApi.endpointUrl = "https://localhost:4444";`

## TODO
- add suffix for enumerations and add a get values list 
- delete typings on js maybe js only 
- time to add tests
- add a configuration file how to split services

