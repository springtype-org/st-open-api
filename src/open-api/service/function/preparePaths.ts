import { IPaths } from '../../interface/open-api-mine/i-paths';
import { IParameter } from '../../interface/open-api-mine/i-parameter';
import { IPathItem } from '../../interface/open-api-mine/i-path-item';

export const mergeParameter = (
  parameters: Array<IParameter>,
  pathItem: IPathItem | undefined,
  method: 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace',
) => {
  const operation = pathItem[method];
  if (typeof operation !== 'undefined') {
    const uniqueRefMap: { [k: string]: { $ref: string } } = {};
    const uniqueMap: { [k: string]: IParameter } = {};

    [...(parameters ?? []), ...(operation.parameters ?? [])].forEach((v) => {
      const isRef = !!v['$ref'];
      const isParam = !!v['in'] && !!v['name'];
      if (isRef) {
        const ref = v as { $ref: string };
        uniqueRefMap[ref.$ref] = ref;
      } else if (isParam) {
        const param = v as IParameter;
        uniqueMap[param.in + '_' + param.name] = param;
      }
    });

    operation.parameters = [...Object.values(uniqueRefMap), ...Object.values(uniqueMap)];
  }
  return pathItem;
};

export const mergeParameters = (paths: IPaths): IPaths => {
  const result: IPaths = {};
  for (const path of Object.keys(paths)) {
    let value = paths[path];
    const parameters = value.parameters;
    if (typeof parameters !== 'undefined') {
      value = mergeParameter(parameters, value, 'get');
      value = mergeParameter(parameters, value, 'put');
      value = mergeParameter(parameters, value, 'post');
      value = mergeParameter(parameters, value, 'delete');
      value = mergeParameter(parameters, value, 'options');
      value = mergeParameter(parameters, value, 'head');
      value = mergeParameter(parameters, value, 'patch');
      value = mergeParameter(parameters, value, 'trace');

      delete value.parameters;
    }
    result[path] = value;
  }

  return result;
};
