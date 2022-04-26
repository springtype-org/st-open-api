import * as fs from 'fs';
import * as nodePath from 'path';
import { IOperation } from '../interface/open-api-mine/i-operation';
import { getSortedParameter } from './get-sorted-parameter';
import { createResponseInterfaces } from './create-response-interfaces';
import { createRequestBodyInterfaces } from './create-request-body-interfaces';
import { getInterfaceOrEnumFromSchema } from './get-property';
import { ISchema } from '../interface/open-api-mine/i-schema';
import {
  HTTP_CONVERT_TO_FORM_DATA_REF,
  HTTP_FUNCTION_REF,
  HTTP_ON_BINARY_BEFORE_SEND_FUNCTION_REF,
  HTTP_ON_BINARY_LOAD_FUNCTION_REF,
  HTTP_ON_JSON_LOAD_FUNCTION_REF,
  HTTP_ON_PLAIN_TEXT_LOAD_FUNCTION_REF,
  HTTP_OPTION_INTERFACE_REF,
  IFunction,
  ObjectProperty,
  OPEN_API_INTERFACE_REF,
} from '../classes/object-property';
import { kebabCaseToCamel } from './kebab-case-to-camel';
import { Configuration, configuration } from './config';
import { IParameter } from '../interface/open-api-mine/i-parameter';
import { IRefResult } from '../classes/register';
import { firstCharacterLower, formatText } from '../common/function/text/formatText';
import { createRequestBody } from '../service/function/createRequestBody';
import { createResponse } from '../service/function/createResponse';

const createParameter = (
  type: 'query' | 'header' | 'path' | 'cookie',
  functionName: string,
  parameters: { [parameterName: string]: IParameter },
  serviceFolder: string,
): IRefResult => {
  const parameterClassName = `I${functionName.substring(0, 1).toUpperCase()}${functionName.substring(1)}${type
    .substring(0, 1)
    .toUpperCase()}${type.substring(1)}Parameter`;

  const reference = configuration.getReference();
  const folder = configuration.getFolderManager();

  const parameterObject: ISchema = {
    type: 'object',
    required: [],
    properties: {},
  };
  Object.values(parameters).forEach((p) => {
    // HTTP authorization header shall be added via interceptor,
    // not be necessary to be provided for every single request
    if (p.name === 'authorization' && type === 'header') return;
    const normalizedName = formatText([p.name], 'Any', 'CamelCase');
    if (p.required) {
      parameterObject.required.push(normalizedName);
    }
    parameterObject.properties[normalizedName] = p.schema;
  });

  const classToRender = getInterfaceOrEnumFromSchema(
    parameterClassName,
    functionName,
    parameterObject,
    folder.getInterfaceParameterFolder(),
  );

  const rendered = classToRender.render();
  fs.appendFileSync(nodePath.join(folder.getInterfaceParameterFolder(), `${rendered.fileName}.ts`), rendered.render);
  const schemaName = `#/schema/parameter/${parameterClassName}`;

  reference.addReference(schemaName, {
    fileName: rendered.fileName,
    className: rendered.classEnumName,
    folderPath: folder.getInterfaceParameterFolder(),
  });

  return reference.getImportAndTypeByRef(schemaName, serviceFolder);
};

const getOperationId = (httpMethod: string, path: string, operationId: string | undefined): string => {
  if (operationId) {
    return firstCharacterLower(kebabCaseToCamel(operationId.replace('.', '_').replace('_', '-')));
  }
  const newPath = path
    .split('/')
    .filter((p) => !!p)
    .map((p) => {
      if (p.startsWith('{')) {
        return `By${p.substr(1, 1).toUpperCase()}${p.substr(2)}`;
      }
      return p;
    })
    .map((p) => {
      if (p.endsWith('}')) {
        return p.substr(0, p.length - 1);
      }
      return p;
    })
    .map((p) => formatText([p], 'Any', 'PascalCase'))
    .join('');
  return `${httpMethod.toLowerCase()}${newPath}`;
};

export const getServiceHttpFunction = (
  objProperty: ObjectProperty,
  httpMethod: string,
  path: string,
  operation: IOperation,
  config: Configuration = configuration,
) => {
  if (operation) {
    const reference = config.getReference();
    const folder = config.getFolderManager();

    const serviceFolder = objProperty.getFolderPath();
    const functionName = config.getCreateServiceFunctionName()(httpMethod, path, operation.operationId);
    const requestBody = createRequestBodyInterfaces(functionName, operation.requestBody, serviceFolder);
    const requestBody1 = createRequestBody(functionName, operation.requestBody, serviceFolder);
    const requestBodyKeys = Object.keys(requestBody1);
    if (requestBodyKeys.length > 0) {
      console.log('requestBodies', requestBodyKeys);
    }
    const response = createResponseInterfaces(functionName, operation.responses, serviceFolder);
    const response1 = createResponse(functionName, operation.responses, serviceFolder);
    const responseKeys = Object.keys(response1);
    if (responseKeys.length > 0) {
      console.log('responses', responseKeys);
    }
    const sortedParameter = getSortedParameter(path, operation.parameters, config);

    const operationFunction: IFunction = {
      functionName,
      forceInterceptor: config.forceInterceptor(),
      imports: [],

      httpMethod,
      originalPath: path,

      description: operation.description || operation.summary,

      ...requestBody,
      ...response,
    };
    operationFunction.imports.push(requestBody.import);
    operationFunction.imports.push(response.import);

    if (Object.keys(sortedParameter.query).length > 0) {
      const importRef = createParameter('query', functionName, sortedParameter.query, serviceFolder);
      operationFunction.queryParameters = {
        className: importRef.className,
        params: Object.keys(sortedParameter.query).map((headerName) => ({
          name: headerName,
          value: formatText([headerName], 'Any', 'CamelCase'),
        })),
      };
      operationFunction.imports.push(importRef);
    }

    if (Object.keys(sortedParameter.header).length > 0) {
      const importRef = createParameter('header', functionName, sortedParameter.header, serviceFolder);
      operationFunction.headerParameters = {
        className: importRef.className,
        params: Object.keys(sortedParameter.header).map((headerName) => ({
          name: headerName,
          value: formatText([headerName], 'Any', 'CamelCase'),
        })),
      };
      operationFunction.imports.push(importRef);
    }

    if (Object.keys(sortedParameter.path).length > 0) {
      const importRef = createParameter('path', functionName, sortedParameter.path, serviceFolder);
      operationFunction.pathParameters = {
        className: importRef.className,
        params: Object.keys(sortedParameter.path).map((headerName) => ({
          name: headerName,
          value: formatText([headerName], 'Any', 'CamelCase'),
        })),
      };
      operationFunction.imports.push(importRef);
    }

    const functionImports = [HTTP_FUNCTION_REF, HTTP_OPTION_INTERFACE_REF, OPEN_API_INTERFACE_REF];

    if (!!operationFunction.responseClass && operationFunction.isJsonResponse) {
      functionImports.push(HTTP_ON_JSON_LOAD_FUNCTION_REF);
    }

    if (!!operationFunction.responseClass && operationFunction.isPlaintextResponse) {
      functionImports.push(HTTP_ON_PLAIN_TEXT_LOAD_FUNCTION_REF);
    }

    if (operationFunction.isDownloadResponse) {
      functionImports.push(HTTP_ON_BINARY_BEFORE_SEND_FUNCTION_REF);
      functionImports.push(HTTP_ON_BINARY_LOAD_FUNCTION_REF);
    }

    if (operationFunction.isRequestBodyUpload) {
      functionImports.push(HTTP_CONVERT_TO_FORM_DATA_REF);
    }

    functionImports
      .map((fun) => fun(folder))
      .map((httpRef) => reference.getImportAndTypeByRef(httpRef.refKey, serviceFolder))
      .forEach((refResult) => objProperty.addImports(refResult));

    objProperty.addFunction(operationFunction);
  }
};
