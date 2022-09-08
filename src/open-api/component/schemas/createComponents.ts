import { IComponents } from '../../interface/open-api-mine/i-components';
import { ISchema } from '../../interface/open-api-mine/i-schema';
import { Configuration } from '../../classes/Configuration';
import { getComponentType } from './property/getComponentType';
import { registerComponent } from './registerComponent';
import { createComponent } from './createComponent';

export const COMPONENT_SCHEMA_KEY = '#/components/schemas/';

export const createComponents = (components: IComponents, config: Configuration) => {
  const logger = config.getLogger();
  const folderManager = config.getFolderManager();

  if (components && components.schemas) {
    logger.info('Register component interfaces');
    const { schemas } = components;
    const schemaNames = Object.keys(schemas);
    const folderPath = folderManager.getInterfaceComponentsFolder();
    for (const schemaName of schemaNames) {
      const schema = schemas[schemaName];
      const type = getComponentType(schemaName, schema, config);
      if (type) {
        registerComponent(schemaName, COMPONENT_SCHEMA_KEY, folderPath, type, schema, config);
      }
    }
    logger.info('Creating component interfaces');
    for (const schemaName of schemaNames) {
      const schema = schemas[schemaName] as ISchema;
      try {
        const type = getComponentType(schemaName, schema, config);
        if (type) {
          createComponent(schemaName, schema, COMPONENT_SCHEMA_KEY, folderPath, type, config);
        }
      } catch (e) {
        logger.warn(`Fatal error creating component ${schemaName}`);
        logger.warn('- schema', JSON.stringify(schema, null, 2));
        logger.warn('- error', e);
      }
    }
    logger.debug('Component creation done');
  }
};
