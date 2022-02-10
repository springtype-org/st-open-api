import { ComponentType } from '../ComponentType';
import { configuration, Configuration } from '../../function/config';

export const getComponentType = (
  schemaName: string,
  schema: any,
  config: Configuration = configuration,
): Exclude<ComponentType, 'CLASS'> | undefined => {
  if (schema.type === 'object' || schema.allOf || schema.$ref) {
    return 'INTERFACE';
  }
  if (schema.enum) {
    return 'ENUM';
  }
  if (schema.type === 'array') {
    return 'ARRAY';
  }
  const logger = config.getLogger();
  logger.warn(`- unknown component type ${schemaName}`);
  logger.debug('- schema', JSON.stringify(schema, null, 2));
  return undefined;
};
