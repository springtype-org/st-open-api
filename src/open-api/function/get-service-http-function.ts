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
import { firstCharacterLower } from './first-character-lower';
import { configuration } from './config';
import { formatText } from './formatText';
import { IParameter } from '../interface/open-api-mine/i-parameter';
import { IRefResult } from '../classes/ref';

const createParameter = (
  type: 'query' | 'header' | 'path' | 'cookie',
  functionName: string,
  parameters: { [parameterName: string]: IParameter },
  serviceFolder: string,
): IRefResult => {
  const parameterClassName = `I${functionName.substring(0, 1).toUpperCase()}${functionName.substring(
    1,
  )}${type.substring(0, 1).toUpperCase()}${type.substring(1)}Parameter`;

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
    const normalizedName = formatText(p.name, 'ANY', 'CamelCase');
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
    .map((p) => formatText(p, 'ANY', 'PascalCase'))
    .join('');
  return `${httpMethod.toLowerCase()}${newPath}`;
};

export const getServiceHttpFunction = (
  objPropertyAuth: ObjectProperty,
  objPropertyNoAuth: ObjectProperty,
  httpMethod: string,
  path: string,
  operation: IOperation,
) => {
  if (operation) {
    const reference = configuration.getReference();
    const folder = configuration.getFolderManager();

    const hasSecurity = operation.security;
    const objProperty = hasSecurity ? objPropertyAuth : objPropertyNoAuth;
    const serviceFolder = hasSecurity ? folder.getAuthServiceFolder() : folder.getNoAuthServiceFolder();

    const functionName = getOperationId(httpMethod, path, operation.operationId);
    const requestBody = createRequestBodyInterfaces(functionName, operation.requestBody, serviceFolder);
    const response = createResponseInterfaces(functionName, operation.responses, serviceFolder);

    const sortedParameter = getSortedParameter(path, operation.parameters);

    const operationFunction: IFunction = {
      functionName,
      forceInterceptor: configuration.forceInterceptor(),
      imports: [],

      httpMethod,
      originalPath: path,

      description: operation.description,

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
          value: formatText(headerName, 'ANY', 'CamelCase'),
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
          value: formatText(headerName, 'ANY', 'CamelCase'),
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
          value: formatText(headerName, 'ANY', 'CamelCase'),
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
