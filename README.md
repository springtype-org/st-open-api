# st-open-api

this api create an client for open api specification version 3.0.x

usage:
`npx st-open-api -s open-api.json -o client`

## options
-s **source** _required_ the path or url to open-api as JSON

-o **output** _required_ the output path existing files will be overridden

-u **useSpringtype** add springtype decorators to service class: default _false_

-f **force** _optional_  ignore result of validation: default _false_

-d **debug** _optional_  output debug information: default _false_

### Configuration

the global _$openApi_ can be manipulate some variables and every request.
 
**requestInterceptor**: is called before any request is done, here you can manipulate every request, for example add an api-token header.
 
**endpointUrl**: add here the endpoint url that will be set in every request as prefix.

## Examples

Setting an specific endpoint url

`$openApi.endpointUrl = "https://localhost:4444";`

## TODO
- split logic of interface and class
