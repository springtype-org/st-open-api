import { IPaths } from '../../interface/open-api-mine/i-paths';
import { IParameter } from '../../interface/open-api-mine/i-parameter';
import { IPathItem } from '../../interface/open-api-mine/i-path-item';

export const mergeParameter = (
  parameter: Array<IParameter>,
  pathItem: IPathItem | undefined,
  method: 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace',
) => {
  const operation = pathItem[method];
  if (typeof operation !== 'undefined') {
    const uniqueRefMap: { [k: string]: { $ref: string } } = (
      [...parameter, ...(operation.parameters ?? [])].filter((v) => !!v['$ref']) as Array<{ $ref: string }>
    ).reduce(
      (prev, curr) => ({
        ...prev,
        [curr['$ref']]: curr,
      }),
      {},
    );

    const uniqueMap: { [k: string]: IParameter } = (
      [...parameter, ...(operation.parameters ?? [])].filter(
        (v) => typeof v['$ref'] !== 'undefined',
      ) as Array<IParameter>
    ).reduce(
      (prev, curr) => ({
        ...prev,
        [curr.in + '_' + curr.name]: curr,
      }),
      {},
    );
    pathItem[method].parameters = [...Object.values(uniqueRefMap), ...Object.values(uniqueMap)];
  }
  return pathItem;
};

export const preparePaths = (paths: IPaths): IPaths => {
  const result: IPaths = {};
  for (const path of Object.keys(paths)) {
    let value = paths[path];
    const parameters = value.parameters;
    if (typeof parameters !== 'undefined') {
      delete value.parameters;

      value = mergeParameter(parameters, value, 'get');
      value = mergeParameter(parameters, value, 'put');
      value = mergeParameter(parameters, value, 'post');
      value = mergeParameter(parameters, value, 'delete');
      value = mergeParameter(parameters, value, 'options');
      value = mergeParameter(parameters, value, 'head');
      value = mergeParameter(parameters, value, 'patch');
      value = mergeParameter(parameters, value, 'trace');
    }
    result[path] = value;
  }

  return result;
};
