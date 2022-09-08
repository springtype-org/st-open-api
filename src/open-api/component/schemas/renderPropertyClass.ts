import { join } from 'path';
import { IPropertyClass } from '../../interface/i-property-class';
import { Configuration } from '../../classes/Configuration';

export const renderPropertyClass = (propertyClass: IPropertyClass, config: Configuration) => {
  const logger = config.getLogger();
  const writeFileSync = config.getWriteFileSyncFn();

  const rendered = propertyClass.render();
  const originalName = propertyClass.getOriginalName();
  const name = propertyClass.getName();
  const type = propertyClass.getType();
  const folderPath = propertyClass.getFolderPath();
  const schema = propertyClass.getSchema();
  const fileName = propertyClass.getFileName();

  const filePath = join(folderPath, `${fileName}${config.getFileExtension()}`);

  // TODO: check if already exists
  writeFileSync(filePath, rendered.render);
  logger.debug(`- create component ${name}`);
  logger.debug('-- schema', JSON.stringify(schema, null, 2));
  logger.debug(`-- file name: ${fileName}`);
  logger.debug(`-- type: ${type}`);
  logger.debug(`-- class name: ${name}`);
  logger.debug(`-- original name: ${originalName}`);
  logger.debug(`-- folder path: ${folderPath}`);
};
