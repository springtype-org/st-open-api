import { getPropertyFactory, PropertyFactoryOptions } from './getPropertyFactory';
import { InterfaceProperty } from '../../../classes/InterfaceProperty';
import { IPropertyClass } from '../../../interface/i-property-class';
import { registerComponent } from '../registerComponent';
import { isPropertyPrimitive, Primitive } from './isPropertyPrimitive';
import { getPropertyDescription } from './getPropertyDescription';
import { getNormalizedName } from './getNoramlizedName';
import { Configuration } from '../../../classes/Configuration';
import { splitByLineBreak } from '../../../function/splitByLineBreak';
import { onDefined } from '../../../function/onDefined';
import { ISchema } from '../../../interface/open-api-mine/i-schema';
import { InterfaceOneOfProperty } from '../../../classes/InterfaceOneOfProperty';

export const resolveAllOfOrRef = (schema: ISchema, folderPath: string, config: Configuration) => {
  let response = schema;
  const isAllOf = !!schema.allOf;
  let schemaAllOfOrRef = schema.allOf;

  if (typeof schema.$ref !== 'undefined') {
    schemaAllOfOrRef = [{ $ref: schema.$ref }];
  }
  if (schemaAllOfOrRef) {
    response = schemaAllOfOrRef
      .map((allOfSchema) => {
        const schemaRef = allOfSchema.$ref;
        if (schemaRef) {
          return resolveAllOfOrRef(
            config.getReference().getImportAndTypeByRef(schemaRef, folderPath).schema,
            folderPath,
            config,
          );
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
  //have to merge properties
  if (isAllOf) {
    if (schema.properties) {
      const entries = Object.entries(schema.properties);
      if (!response.properties) {
        response.properties = {};
      }
      for (const entry of entries) {
        const propertyName = entry[0];
        const propertyValue = entry[1];

        if (response.properties[propertyName]) {
          config.getLogger().warn(`Overriding property ${propertyName}`);
        }
        response.properties[propertyName] = propertyValue;
      }
    }
    if (schema.required) {
      const values = Object.values(schema.required);
      if (!response.required) {
        response.required = [];
      }
      for (const value of values) {
        if (response.required.indexOf(value) !== -1) {
          config.getLogger().warn(`Property is already required ${value}`);
        } else {
          response.required.push(value);
        }
      }
    }
  }
  return response;
};

export const createInterfaceProperty = (
  options: PropertyFactoryOptions,
  config: Configuration,
): Array<IPropertyClass> => {
  const result: Array<IPropertyClass> = [];
  const { schemaName, schema: rawSchema, round, prefixRefKey, folderPath } = options;

  if (rawSchema.oneOf) {
    const oneOfElement = new InterfaceOneOfProperty(schemaName, folderPath, prefixRefKey, rawSchema, config);
    for (const one of rawSchema.oneOf) {
      if (one.$ref) {
        const refSchema = one.$ref;
        const schemaResult = config.getReference().getImportAndTypeByRef(refSchema, folderPath);
        oneOfElement.addImports(schemaResult);
        oneOfElement.addOneOf(schemaResult.className);
      } else {
        config.getLogger().warn('Unknown oneOf', schemaName, rawSchema);
      }
    }
    result.push(oneOfElement);
    return result;
  }

  const logger = config.getLogger();

  const schema = resolveAllOfOrRef(rawSchema, folderPath, config);

  const interfaceProperty = new InterfaceProperty(schemaName, folderPath, prefixRefKey, schema, config);
  interfaceProperty.description = ['Open-api schema', ...splitByLineBreak(JSON.stringify(schema, null, 2))];
  if (round > 0) {
    registerComponent(schemaName, prefixRefKey, folderPath, 'INTERFACE', schema, config);
  }
  result.push(interfaceProperty);

  const objectProperties = schema.properties;
  if (objectProperties) {
    const requiredProperties = schema.required || [];
    const objectPropertyNames = Object.keys(objectProperties).sort();
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
          propertyObjects.forEach((propertyObject) => {
            //create component if not exist!
            if (!config.getReference().getImportAndTypeByRef(propertyObject.getReferenceKey(), folderPath)) {
              config.getReference().addReference(propertyObject.getReferenceKey(), {
                className: propertyObject.getName(),
                fileName: propertyObject.getFileName(),
                folderPath: propertyObject.getFolderPath(),
                schema: propertyObject.getSchema(),
              });
            }
          });
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
          logger.warn('- error in nested schema ', schemaName, propertyName, e);
        }
      }

      if (propertyValue) {
        interfaceProperty.addProperty({
          isArray,
          value: propertyValue,
          required,
          description: onDefined(getPropertyDescription(property), ''),
          propertyName,
        });
      }
    }
  }

  const { additionalProperties } = schema;
  if (additionalProperties === true || additionalProperties === false) {
    if (additionalProperties === true) {
      interfaceProperty.addAdditionalProperties('any', false);
    }
  } else if (additionalProperties) {
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
      const nestedSchemaName = getNormalizedName('INTERFACE', config, schemaName, ['additional', 'properties']);
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
