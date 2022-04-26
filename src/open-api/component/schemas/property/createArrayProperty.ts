import { getPropertyFactory, PropertyFactoryOptions } from './getPropertyFactory';
import { IPropertyClass } from '../../../interface/i-property-class';
import { Configuration, configuration } from '../../../function/config';
import { InterfaceArrayProperty } from '../../../classes/interface-array-property';

export const createArrayProperty = (
  options: PropertyFactoryOptions,
  config: Configuration = configuration,
): Array<IPropertyClass> => {
  const { schema, folderPath, schemaName, prefixRefKey, round } = options;
  const logger = config.getLogger();

  const result: Array<IPropertyClass> = [];

  if (schema.type === 'array') {
    if (schema.items.$ref) {
      const ref = configuration.getReference().getImportAndTypeByRef(schema.items.$ref, folderPath);
      result.push(new InterfaceArrayProperty(schemaName, ref, folderPath, prefixRefKey, config));
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
        console.log(nestedResults.length, nestedResults);
        const firstResult = nestedResults[0];
        const ref = configuration.getReference().getImportAndTypeByRef(firstResult.getReferenceKey(), folderPath);
        result.push(new InterfaceArrayProperty(schemaName, ref, folderPath, prefixRefKey, config));
      } else {
        logger.warn(`Missing child element on array ${schemaName}`);
        logger.warn('- schema', schema);
      }
      result.push(...nestedResults);
    }
  }

  return result;
};
