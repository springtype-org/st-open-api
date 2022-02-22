import { formatText } from './text/formatText';

export const createServiceFunctionName = (
  httpMethod: string,
  path: string,
  operationId: string | undefined,
): string => {
  if (operationId) {
    return formatText([operationId], 'Any', 'CamelCase');
  }
  return formatText([httpMethod, ...path.split('/').filter((v) => !!v)], 'Any', 'CamelCase');
};
