import { PropertyFactoryOptions } from './getPropertyFactory';
import { IPropertyClass } from '../../../interface/i-property-class';
import { EnumProperty } from '../../../classes/enum-property';
import { registerComponent } from '../registerComponent';
import { configuration, Configuration } from '../../../function/config';

export const createEnumProperty = (
  options: PropertyFactoryOptions,
  config: Configuration = configuration,
): Array<IPropertyClass> => {
  const { schema, schemaName, round, prefixRefKey, folderPath } = options;

  const result: Array<IPropertyClass> = [];
  const enumClass = new EnumProperty(schemaName, folderPath, prefixRefKey, config);
  enumClass.setValues(schema.enum);

  result.push(enumClass);
  if (round > 0) {
    registerComponent(schemaName, prefixRefKey, folderPath, 'ENUM', schema, config);
  }

  return result;
};
