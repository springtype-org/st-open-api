import { appendFileSync } from 'fs';
import { join } from 'path';
import { IComponents } from '../interface/open-api-mine/i-components';
import { ISchema } from '../interface/open-api-mine/i-schema';
import { getInterfaceOrEnumFromSchema } from './get-property';
import { configuration } from './config';
import { formatText } from '../common/function/text/formatText';

export const createComponentInterfaces = (components: IComponents) => {
  const isDebug = configuration.isDebug();
  const reference = configuration.getReference();
  const folderManager = configuration.getFolderManager();

  if (components && components.schemas) {
    if (isDebug) {
      console.log('Create component Interfaces');
    }
    const { schemas } = components;
    for (const schemaName of Object.keys(schemas)) {
      const className = `I${formatText(schemaName, 'Any', 'PascalCase')}`;
      const fileName = formatText(className, 'PascalCase', 'KebabCase');

      reference.addReference(`#/components/schemas/${schemaName}`, {
        fileName,
        className,
        folderPath: folderManager.getInterfaceComponentsFolder(),
      });
      if (isDebug) {
        console.log(`Add new reference ${className} -> ${fileName}`);
      }
    }

    for (const schemaName of Object.keys(schemas)) {
      try {
        const schema = schemas[schemaName] as ISchema;
        if (isDebug) {
          console.log(`Create interface ${schemaName}`);
          console.log(`Schema  ${schemaName}`, JSON.stringify(schema, null, 2));
        }
        const interfaceOrEnumeration = getInterfaceOrEnumFromSchema(
          `I${formatText(schemaName, 'Any', 'PascalCase')}`,
          schemaName,
          schema,
          folderManager.getInterfaceComponentsFolder(),
        );
        if (interfaceOrEnumeration) {
          const rendered = interfaceOrEnumeration.render();

          appendFileSync(
            join(folderManager.getInterfaceComponentsFolder(), `${rendered.fileName}.ts`),
            rendered.render,
          );
        }
        if (isDebug) {
          console.log(`Finish interface ${schemaName} creation`);
        }
      } catch (e) {
        console.error(e);
      }
    }
    if (isDebug) {
      console.log('Finish component interface creation');
    }
  }
};
