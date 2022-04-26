import { IParameter } from '../interface/open-api-mine/i-parameter';
import { ISortedParameter } from '../interface/i-sorted-parameter';
import { configuration, Configuration } from './config';

export const getSortedParameter = (
  path: string,
  parameters: Array<IParameter | { $ref: string }> = [],
  config: Configuration = configuration,
): ISortedParameter => {
  const logger = config.getLogger();
  const result: ISortedParameter = {
    cookie: {},
    header: {},
    query: {},
    path: {},
  };

  const parameterRegistry = config.getParameterRegister();
  for (let parameter of parameters) {
    const ref = parameter['$ref'];
    //override if its an ref
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

    // no apply of 'authorization' header in each API endpoint;
    // this shall be done in an interceptor
    if (type === 'header' && typedParam.name === 'authorization') continue;

    result[type][typedParam.name] = typedParam;
  }

  return result;
};
