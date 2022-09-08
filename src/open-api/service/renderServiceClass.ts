import { ObjectProperty } from '../classes/ObjectProperty';
import nodePath from 'path';
import fs from 'fs';
import { Configuration } from '../classes/Configuration';

export const renderServiceClass = (objectProperty: ObjectProperty, config: Configuration) => {
  if (objectProperty.functions.length >= 0) {
    const rendered = objectProperty.render();
    const serviceFolderPath = objectProperty.getFolderPath();

    const registerReference: string =
      '#/services/schemas/' +
      nodePath.relative(config.getFolderManager().getServiceFolder(), serviceFolderPath) +
      '/' +
      rendered.classEnumName;

    config.getReference().addReference(
      registerReference,
      {
        className: rendered.classEnumName,
        fileName: rendered.fileName,
        folderPath: serviceFolderPath,
      },
      serviceFolderPath,
    );
    fs.mkdirSync(serviceFolderPath, { recursive: true });

    fs.writeFileSync(nodePath.join(serviceFolderPath, `${rendered.fileName}.ts`), rendered.render, { flag: 'w' });
  }
};
