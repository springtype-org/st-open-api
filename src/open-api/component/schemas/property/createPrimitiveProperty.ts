import { PropertyFactoryOptions } from './getPropertyFactory';
import { IPropertyClass } from '../../../interface/i-property-class';
import { registerComponent } from '../registerComponent';
import { Configuration } from '../../../classes/Configuration';
import { PrimitiveProperty } from '../../../classes/PrimitiveProperty';
import { Primitive } from './isPropertyPrimitive';
import { getPropertyDescription } from './getPropertyDescription';

export const createPrimitiveProperty = (
  options: PropertyFactoryOptions,
  config: Configuration,
): Array<IPropertyClass> => {
  const { schema, schemaName, round, prefixRefKey, folderPath } = options;

  const result: Array<IPropertyClass> = [];

  const primitiveType = new PrimitiveProperty(schemaName, folderPath, prefixRefKey, schema, config);
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
