import { Configuration } from '../../classes/Configuration';
import { ISchema } from '../../interface/open-api-mine/i-schema';
import { getPropertyFactory } from './property/getPropertyFactory';
import { getNormalizedName } from './property/getNoramlizedName';
import { ComponentType } from './ComponentType';
import { renderPropertyClass } from './renderPropertyClass';

export const createComponent = (
  schemaName: string,
  schema: ISchema,
  prefixRefKey: string,
  folderPath: string,
  type: ComponentType,
  config: Configuration,
) => {
  const logger = config.getLogger();
  const propertyClasses = getPropertyFactory({ schemaName, schema, prefixRefKey, folderPath, round: 0 }, config);

  if (propertyClasses.length > 0) {
    for (const propertyClass of propertyClasses) {
      renderPropertyClass(propertyClass, config);
    }
  } else {
    logger.warn(`- error creating component ${schemaName}`);
    logger.debug('-- schema', JSON.stringify(schema, null, 2));
    logger.debug(`-- type: ${type}`);
    logger.debug(`-- class name: ${getNormalizedName(type, config, schemaName)}`);
    logger.debug(`-- folder path: ${folderPath}`);
  }
};
