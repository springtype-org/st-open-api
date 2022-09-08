import { PropertyFactoryOptions } from './getPropertyFactory';
import { IPropertyClass } from '../../../interface/i-property-class';
import { EnumProperty } from '../../../classes/EnumProperty';
import { registerComponent } from '../registerComponent';
import { Configuration } from '../../../classes/Configuration';

export const createEnumProperty = (options: PropertyFactoryOptions, config: Configuration): Array<IPropertyClass> => {
  const { schema, schemaName, round, prefixRefKey, folderPath } = options;

  const result: Array<IPropertyClass> = [];
  const enumClass = new EnumProperty(schemaName, folderPath, prefixRefKey, schema, config);
  enumClass.setValues(schema.enum);

  result.push(enumClass);
  if (round > 0) {
    registerComponent(schemaName, prefixRefKey, folderPath, 'ENUM', schema, config);
  }

  return result;
};
