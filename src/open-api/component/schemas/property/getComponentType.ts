import { ComponentType } from '../ComponentType';
import { configuration, Configuration } from '../../../function/config';
import { isPropertyPrimitive } from './isPropertyPrimitive';

export const getComponentType = (
  schemaName: string,
  schema: any,
  config: Configuration = configuration,
): Exclude<ComponentType, 'CLASS'> | undefined => {
  if (schema.enum) {
    return 'ENUM';
  }
  if (schema.type === 'object' || schema.allOf || schema.$ref) {
    return 'INTERFACE';
  }
  if (schema.type === 'array') {
    return 'ARRAY';
  }
  if (isPropertyPrimitive(schema)) {
    return 'PRIMITIVE';
  }
  const logger = config.getLogger();
  logger.warn(`- unknown component type ${schemaName}`);
  logger.warn('- schema', JSON.stringify(schema, null, 2));
  return undefined;
};
