import { getPropertyFactory, PropertyFactoryOptions } from './getPropertyFactory';
import { IPropertyClass } from '../../../interface/i-property-class';
import { Configuration } from '../../../classes/Configuration';
import { InterfaceArrayProperty } from '../../../classes/InterfaceArrayProperty';

export const createArrayProperty = (options: PropertyFactoryOptions, config: Configuration): Array<IPropertyClass> => {
  const { schema, folderPath, schemaName, prefixRefKey, round } = options;
  const logger = config.getLogger();

  const result: Array<IPropertyClass> = [];

  if (schema.type === 'array') {
    if (schema.items?.$ref) {
      const ref = config.getReference().getImportAndTypeByRef(schema.items.$ref, folderPath);
      result.push(new InterfaceArrayProperty(schemaName, ref, folderPath, prefixRefKey, schema, config));
    } else {
      const nestedResults = getPropertyFactory(
        {
          schema: schema.items,
          // TODO: fix me in future
          schemaName: schemaName + '_item',
          folderPath,
          round: round + 1,
          prefixRefKey,
        },
        config,
      );
      if (nestedResults.length >= 1) {
        const firstResult = nestedResults[0];
        const ref = config.getReference().getImportAndTypeByRef(firstResult.getReferenceKey(), folderPath);
        result.push(new InterfaceArrayProperty(schemaName, ref, folderPath, prefixRefKey, schema, config));
      } else {
        logger.warn(`Missing child element on array ${schemaName}`);
        logger.warn('- schema', schema);
      }
      result.push(...nestedResults);
    }
  }

  return result;
};
