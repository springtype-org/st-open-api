import { createComponentReference } from '../../common/function/createComponentReference';
import { Configuration, configuration } from '../../function/config';
import { ComponentType } from './ComponentType';

export type RegisterComponentOptions = {
  definition?: any;
};

export const registerComponent = (
  schemaName: string,
  prefixRefKey: string,
  folderPath: string,
  type: ComponentType,
  schema: any,
  config: Configuration = configuration,
) => {
  const logger = config.getLogger();
  const register = config.getReference();

  const { fileName, name, refKey } = createComponentReference(schemaName, type, prefixRefKey);

  register.addReference(refKey, {
    fileName,
    className: name,
    folderPath,
    schema,
  });

  logger.debug(`Register component ${schemaName}`);
  logger.debug(`- registered key: ${refKey}`);
  logger.debug(`- has definition: ${!!schema}`);
  logger.debug(`- file name: ${fileName}`);
  logger.debug(`- interface name: ${name}`);
  logger.debug(`- folder path: ${name}`);
};
