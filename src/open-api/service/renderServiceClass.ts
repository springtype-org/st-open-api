import { ObjectProperty } from '../classes/object-property';
import { configuration, Configuration } from '../function/config';
import nodePath from 'path';
import fs from 'fs';

export const renderServiceClass = (objectProperty: ObjectProperty, config: Configuration = configuration) => {
  if (objectProperty.functions.length >= 0) {
    const rendered = objectProperty.render();
    const groupName = objectProperty.getFolderPath();

    const registerReference: string = nodePath.join(groupName, objectProperty.className);
    const serviceFolderPath: string = nodePath.join(config.getFolderManager().getServiceFolder(), groupName);

    config.getReference().addReference(
      registerReference,
      {
        className: rendered.classEnumName,
        fileName: rendered.fileName,
        folderPath: serviceFolderPath,
      },
      groupName,
    );
    fs.mkdirSync(serviceFolderPath, { recursive: true });

    fs.appendFileSync(nodePath.join(serviceFolderPath, `${rendered.fileName}.ts`), rendered.render);
  }
};
