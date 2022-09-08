import { IFunction, ImportParameterMapping, ObjectProperty } from '../../classes/ObjectProperty';
import { IOperation } from '../../interface/open-api-mine/i-operation';
import { Configuration } from '../../classes/Configuration';
import { createRequestBody } from './createRequestBody';
import { createResponse } from './createResponse';
import { getParameterMap, ParameterMap } from './getParameterMap';
import { createParameter } from './createParameter';

const RENDER_PARAMETER_MAP: Record<keyof ParameterMap, keyof IFunction> = {
  query: 'queryParameters',
  path: 'pathParameters',
  cookie: 'cookieParameters',
  header: 'headerParameters',
};

export const getServiceHttpFunction = (
  objProperty: ObjectProperty,
  httpMethod: string,
  path: string,
  operation: IOperation,
  config: Configuration,
) => {
  if (!!operation) {
    const serviceFolder = objProperty.getFolderPath();
    const functionName = config.getCreateServiceFunctionName(httpMethod, path, operation.operationId);

    const operationFunction: IFunction = {
      functionName,
      imports: [],

      httpMethod,
      originalPath: path,

      description: operation.description || operation.summary,
      isJsonResponse: false,
      isPlaintextResponse: false,
      isDownloadResponse: false,
      isRequestBodyJson: false,
      isRequestBodyUpload: false,
    };
    const requestBody = createRequestBody(functionName, operation.requestBody, serviceFolder, config);
    const requestBodyKeys = Object.keys(requestBody);
    if (requestBodyKeys.length > 0) {
      const importClazz = Object.values(requestBody)[0];
      operationFunction.isRequestBodyJson = true;
      operationFunction.imports.push(importClazz);
      operationFunction.requestBodyClass = importClazz.className;
    }

    const response = createResponse(functionName, operation.responses, serviceFolder, config);
    if (typeof response['application/json'] !== 'undefined') {
      const importClazz = response['application/json'];
      operationFunction.isJsonResponse = true;
      operationFunction.imports.push(importClazz);
      operationFunction.responseClass = importClazz.className;
    }

    const parameterMap = getParameterMap(path, operation.parameters, config);

    for (const type of Object.keys(parameterMap) as Array<keyof ParameterMap>) {
      const parameter = createParameter(functionName, type, parameterMap, serviceFolder, config);
      if (typeof parameter !== 'undefined') {
        operationFunction.imports.push(parameter);
        const key = RENDER_PARAMETER_MAP[type];
        (operationFunction[key] as ImportParameterMapping) = {
          className: parameter.className,
          params: parameter.params,
        };
      }
    }

    objProperty.addFunction(operationFunction);
  }
};
