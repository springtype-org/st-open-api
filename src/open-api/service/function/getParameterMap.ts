import { IParameter } from '../../interface/open-api-mine/i-parameter';
import { Configuration } from '../../classes/Configuration';

export interface ParameterMap {
  query: { [parameterName: string]: IParameter };
  path: { [parameterName: string]: IParameter };
  cookie: { [parameterName: string]: IParameter };
  header: { [parameterName: string]: IParameter };
}

export const getParameterMap = (
  path: string,
  parameters: Array<IParameter | { $ref: string }> = [],
  config: Configuration,
): ParameterMap => {
  const logger = config.getLogger();
  const result: ParameterMap = {
    cookie: {},
    header: {},
    query: {},
    path: {},
  };

  const parameterRegistry = config.getParameterRegister();
  for (let parameter of parameters) {
    const ref = parameter['$ref'];
    //override if it's a ref
    if (typeof ref !== 'undefined') {
      const paramSchema = parameterRegistry.get(ref);
      if (!paramSchema) {
        logger.warn('Missing parameter schema ' + ref);
        continue;
      }
      parameter = paramSchema;
    }
    const typedParam = parameter as IParameter;
    const type = typedParam.in;

    //TODO: make it configure able
    // no apply of 'authorization' header in each API endpoint;
    // this shall be done in an interceptor
    if (type === 'header' && typedParam.name === 'authorization') continue;

    result[type][typedParam.name] = typedParam;
  }

  return result;
};
