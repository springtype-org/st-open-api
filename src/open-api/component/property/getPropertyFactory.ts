import { ISchema } from '../../interface/open-api-mine/i-schema';
import { IPropertyClass } from '../../interface/i-property-class';
import { createInterfaceProperty } from './createInterfaceProperty';
import { createEnumProperty } from './createEnumProperty';
import { createArrayProperty } from './createArrayProperty';
import { Configuration, configuration } from '../../function/config';
import { getComponentType } from './getComponentType';
import { ComponentType } from '../ComponentType';

export type PropertyFactoryOptions = {
  schemaName: string;
  schema: ISchema;
  prefixRefKey: string;
  folderPath: string;
  round: number;
};

export const getPropertyFactory = (
  options: PropertyFactoryOptions,
  config: Configuration = configuration,
): Array<IPropertyClass> => {
  const result: Array<IPropertyClass> = [];

  const { schema, schemaName } = options;

  const logger = config.getLogger();

  const type = getComponentType(schemaName, schema, config);

  if (type) {
    logger.debug(`- found (type:${type}) ${schemaName}`);
    const componentMap: Record<Exclude<ComponentType, 'CLASS'>, () => Array<IPropertyClass>> = {
      INTERFACE: () => createInterfaceProperty(options, config),
      ENUM: () => createEnumProperty(options, config),
      ARRAY: () => createArrayProperty(options, config),
    };
    result.push(...componentMap[type]());
  }
  return result;
};
