import { ObjectProperty } from '../../classes/object-property';
import { IOperation } from '../../interface/open-api-mine/i-operation';
import { configuration, Configuration } from '../../function/config';
import { createRequestBody } from './createRequestBody';
import { createResponse } from './createResponse';

export const getServiceHttpFunction = (
  objProperty: ObjectProperty,
  httpMethod: string,
  path: string,
  operation: IOperation,
  config: Configuration = configuration,
) => {
  if (operation) {
    const serviceFolder = objProperty.getFolderPath();
    const functionName = config.getCreateServiceFunctionName()(httpMethod, path, operation.operationId);

    const requestBody = createRequestBody(functionName, operation.requestBody, serviceFolder);
    const requestBodyKeys = Object.keys(requestBody);
    if (requestBodyKeys.length > 0) {
      console.log('requestBody', requestBody);
    }

    const response = createResponse(functionName, operation.responses, serviceFolder);
    const responseKeys = Object.keys(response);
    if (responseKeys.length > 0) {
      console.log('responses', responseKeys);
    }
  }
};
