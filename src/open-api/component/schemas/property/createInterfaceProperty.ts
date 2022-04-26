import { getPropertyFactory, PropertyFactoryOptions } from './getPropertyFactory';
import { InterfaceProperty } from '../../../classes/interface-property';
import { IPropertyClass } from '../../../interface/i-property-class';
import { registerComponent } from '../registerComponent';
import { Configuration, configuration } from '../../../function/config';
import { isPropertyPrimitive, Primitive } from './isPropertyPrimitive';
import { formatText } from '../../../common/function/text/formatText';
import { getDescriptionJoin } from './getDescriptionJoin';
import { getFormatPrefix } from './getFormatPrefix';
import { getPatternPrefix } from './getPatternPrefix';
import { getValidationDescription } from './getValidationDescription';
import { getPropertyDescription } from './getPropertyDescription';

export const createInterfaceProperty = (
  options: PropertyFactoryOptions,
  config: Configuration = configuration,
): Array<IPropertyClass> => {
  const result: Array<IPropertyClass> = [];
  const { schemaName, schema: rawSchema, round, prefixRefKey, folderPath } = options;
  const logger = config.getLogger();

  const schemasAllOf = rawSchema.allOf;
  let schema = rawSchema;

  if (schemasAllOf) {
    schema = schemasAllOf
      .map((allOfSchema) => {
        const schemaRef = allOfSchema.$ref;
        if (schemaRef) {
          return config.getReference().getImportAndTypeByRef(schemaRef, folderPath).schema;
        }
        return allOfSchema;
      })
      .filter((v) => !!v)
      .reduce(
        (prev, curr) => ({
          ...prev,
          required: [...(prev?.required || []), ...(curr?.required || [])],
          properties: { ...(prev?.properties || {}), ...(curr?.properties || {}) },
        }),
        { type: 'object' },
      );
  }

  const interfaceProperty = new InterfaceProperty(schemaName, folderPath, prefixRefKey, config);

  if (round > 0) {
    registerComponent(schemaName, prefixRefKey, folderPath, 'INTERFACE', schema, config);
  }
  result.push(interfaceProperty);

  const objectProperties = schema.properties;
  if (objectProperties) {
    const requiredProperties = schema.required || [];
    const objectPropertyNames = Object.keys(objectProperties);
    for (const propertyName of objectPropertyNames) {
      const property = objectProperties[propertyName];
      const required = requiredProperties.indexOf(propertyName) > -1;
      const propertyType = property.type;
      const propertyFormat = property.format;

      let propertyValue: string;

      const isPrimitive = !property.enum && isPropertyPrimitive(property);

      const isArray = propertyType === 'array';
      const nestedSchema = isArray ? property.items : property;
      const isNestedPrimitive = isArray && isPropertyPrimitive(nestedSchema);
      if (nestedSchema.allOf && nestedSchema.allOf.length === 1) {
        nestedSchema.$ref = nestedSchema.allOf[0].$ref;
      }
      if (isPrimitive) {
        propertyValue = config.getMapPrimitiveValuesFn()(propertyType as Primitive, propertyFormat);
      } else if (isNestedPrimitive) {
        propertyValue = config.getMapPrimitiveValuesFn()(nestedSchema.type as Primitive, nestedSchema.format);
      } else if (nestedSchema.$ref) {
        const reference = config.getReference().getImportAndTypeByRef(nestedSchema.$ref, folderPath);
        propertyValue = reference.className;
        interfaceProperty.addImports(reference);
      } else {
        try {
          const nestedSchemaName = config.getCreatePropertyNameFn()(schemaName, propertyName);
          const propertyObjects = getPropertyFactory(
            {
              schema: nestedSchema,
              schemaName: nestedSchemaName,
              folderPath,
              round: round + 1,
              prefixRefKey,
            },
            config,
          );
          result.push(...propertyObjects);
          if (propertyObjects.length >= 1) {
            const propertyObject = propertyObjects[0];
            propertyValue = propertyObject.getName();
            interfaceProperty.addImports(
              config.getReference().getImportAndTypeByRef(propertyObject.getReferenceKey(), folderPath),
            );
          } else {
            logger.warn(`No nested element found ${nestedSchemaName}`);
            logger.warn(`-property ${JSON.stringify(nestedSchema, null, 2)}`);
          }
        } catch (e) {
          logger.warn('- error in nested schema ', schemaName, propertyName);
        }
      }

      if (propertyValue) {
        interfaceProperty.addProperty({
          isArray,
          value: propertyValue,
          required,
          description: getPropertyDescription(property),
          propertyName,
        });
      }
    }
  }

  const { additionalProperties } = schema;
  if (additionalProperties) {
    const additionalPropType = additionalProperties.type;
    const additionalPropFormat = additionalProperties.format;
    const isPrimitive = isPropertyPrimitive(additionalPropType);
    const isArray = additionalPropType === 'array';

    const nestedSchema = isArray ? additionalProperties.items : additionalProperties;
    const isNestedPrimitive = isArray && isPropertyPrimitive(nestedSchema);

    let additionalPropValue: string;

    if (isPrimitive) {
      additionalPropValue = config.getMapPrimitiveValuesFn()(additionalPropType as Primitive, additionalPropFormat);
    } else if (isNestedPrimitive) {
      additionalPropValue = config.getMapPrimitiveValuesFn()(nestedSchema.type as Primitive, nestedSchema.format);
    } else if (additionalProperties.$ref) {
      const reference = config.getReference().getImportAndTypeByRef(additionalProperties.$ref, folderPath);
      additionalPropValue = reference.className;
      interfaceProperty.addImports(reference);
    } else {
      const nestedSchemaName = formatText([schemaName, 'additional', 'properties'], 'Any', 'PascalCase');
      const propertyObjects = getPropertyFactory(
        {
          schema: nestedSchema,
          schemaName: nestedSchemaName,
          folderPath,
          round: round + 1,
          prefixRefKey,
        },
        config,
      );
      result.push(...propertyObjects);
      if (propertyObjects.length >= 1) {
        const propertyObject = propertyObjects[0];
        additionalPropValue = propertyObject.getName();
        interfaceProperty.addImports(
          config.getReference().getImportAndTypeByRef(propertyObject.getReferenceKey(), folderPath),
        );
      } else {
        logger.warn(`No nested additional element found ${nestedSchemaName}`);
        logger.warn(`- schema ${JSON.stringify(additionalProperties, null, 2)}`);
      }
    }
    if (additionalPropValue) {
      interfaceProperty.addAdditionalProperties(additionalPropValue, isArray);
    }
  }
  return result;
};
