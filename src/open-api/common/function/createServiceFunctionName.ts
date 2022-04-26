import { formatText } from './text/formatText';

export const createServiceFunctionName = (
  httpMethod: string,
  path: string,
  operationId: string | undefined,
): string => {
  if (operationId) {
    return formatText([operationId], 'Any', 'CamelCase');
  }
  const parts = path
    .replace(/[{]/g, '/By/')
    .replace(/(}\/)/g, '/And/')
    .split(/[/}]/g)
    .filter((v) => !!v);

  return formatText([httpMethod, ...parts], 'Any', 'CamelCase');
};
