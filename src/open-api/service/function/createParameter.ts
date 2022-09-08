import { ParameterMap } from './getParameterMap';
import { ISchema } from '../../interface/open-api-mine/i-schema';
import { getPropertyFactory } from '../../component/schemas/property/getPropertyFactory';
import { renderPropertyClass } from '../../component/schemas/renderPropertyClass';
import { Configuration } from '../../classes/Configuration';
import { IRefResult } from '../../classes/register';
import { getNormalizedName } from '../../component/schemas/property/getNoramlizedName';

export const PARAMETER_SCHEMA_PREFIX = '#/parameters/schemas/';
export type CreateParameterResponse = IRefResult & { params: Array<{ name: string; value: string }> };

export const createParameter = (
  functionName: string,
  type: keyof ParameterMap,
  paramsMap: ParameterMap,
  folderPath: string,
  config: Configuration,
): CreateParameterResponse | undefined => {
  const parameters = paramsMap[type];
  if (typeof parameters !== 'undefined' && Object.keys(parameters).length > 0) {
    const register = config.getReference();
    const parameterClassName = getNormalizedName('INTERFACE', config, functionName, [type, 'Parameter']);
    const parameterValues = Object.values(parameters);
    const params: Array<{ name: string; value: string }> = [];

    const parameterObject: ISchema = {
      type: 'object',
      required: [],
      properties: {},
    };

    parameterValues.forEach((p) => {
      const normalizedName = p.name;
      if (p.required) {
        parameterObject.required.push(normalizedName);
      }
      params.push({
        name: p.name,
        value: normalizedName,
      });
      parameterObject.properties[normalizedName] = p.schema;
    });

    const classes = getPropertyFactory(
      {
        schemaName: parameterClassName,
        schema: parameterObject,
        prefixRefKey: PARAMETER_SCHEMA_PREFIX,
        folderPath: config.getFolderManager().getInterfaceParameterFolder(),
        round: 0,
      },
      config,
    );
    const result = classes
      .map((clazz) => {
        renderPropertyClass(clazz, config);
        register.addReference(clazz.getReferenceKey(), {
          className: clazz.getName(),
          fileName: clazz.getFileName(),
          folderPath: clazz.getFolderPath(),
          schema: parameterObject,
        });
        return register.getImportAndTypeByRef(clazz.getReferenceKey(), folderPath);
      })
      .find((_, index) => index === 0);

    if (result) {
      return { ...result, params };
    }
  }
  return undefined;
};
