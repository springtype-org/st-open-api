import { PropertyFactoryOptions } from './getPropertyFactory';
import { IPropertyClass } from '../../../interface/i-property-class';
import { registerComponent } from '../registerComponent';
import { configuration, Configuration } from '../../../function/config';
import { PrimitiveProperty } from '../../../classes/primitive-property';
import { Primitive } from './isPropertyPrimitive';
import { getDescriptionJoin } from './getDescriptionJoin';
import { getFormatPrefix } from './getFormatPrefix';
import { getPatternPrefix } from './getPatternPrefix';
import { getValidationDescription } from './getValidationDescription';
import { getPropertyDescription } from './getPropertyDescription';

export const createPrimitiveProperty = (
  options: PropertyFactoryOptions,
  config: Configuration = configuration,
): Array<IPropertyClass> => {
  const { schema, schemaName, round, prefixRefKey, folderPath } = options;

  const result: Array<IPropertyClass> = [];

  const primitiveType = new PrimitiveProperty(schemaName, folderPath, prefixRefKey, config);
  primitiveType.setValue(mapPrimitive(schema.type as Primitive));
  primitiveType.addDescription(getPropertyDescription(schema));

  result.push(primitiveType);
  if (round > 0) {
    registerComponent(schemaName, prefixRefKey, folderPath, 'PRIMITIVE', schema, config);
  }

  return result;
};

const mapPrimitive = (type: Primitive) => {
  const primitiveMap: Record<Primitive, string> = {
    string: 'string',
    boolean: 'boolean',
    number: 'number',
    integer: 'number',
  };
  return primitiveMap[type] ?? 'unknown';
};
