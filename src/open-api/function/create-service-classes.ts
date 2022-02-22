import * as fs from 'fs';
import * as nodePath from 'path';
import { IOpenApi } from '../interface/open-api-mine/i-open-api';
import { getServiceHttpFunction } from './get-service-http-function';
import { ObjectProperty } from '../classes/object-property';
import { Configuration, configuration } from './config';

const renderServiceClass = (objectProperty: ObjectProperty, config: Configuration = configuration) => {
  if (objectProperty.functions.length >= 0) {
    const reference = config.getReference();

    const rendered = objectProperty.render();
    const serviceFolder = objectProperty.getFolderPath();

    const registerReferenceParts: Array<string> = [serviceFolder, objectProperty.className];

    reference.addReference(
      nodePath.join(...registerReferenceParts),
      {
        className: rendered.classEnumName,
        fileName: rendered.fileName,
        folderPath: serviceFolder,
      },
      objectProperty.getFolderPath(),
    );
    const serviceFolderPath: string = objectProperty.getFolderPath();
    fs.mkdirSync(serviceFolderPath, { recursive: true });
    fs.appendFileSync(nodePath.join(serviceFolderPath, `${rendered.fileName}.ts`), rendered.render);
  }
};
export const createServiceClasses = (openApi: IOpenApi, config: Configuration = configuration) => {
  const groupedServices = config.getGroupServiceFn()(openApi.paths);
  const serviceFolder = config.getFolderManager().getServiceFolder();
  for (const folderPath of Object.keys(groupedServices)) {
    for (const groupName of Object.keys(groupedServices[folderPath])) {
      const className = config.getCreateServiceNameFn()(groupName);

      const objectProperty = new ObjectProperty(
        className,
        nodePath.join(serviceFolder, folderPath),
        'service',
        groupName,
      );
      const group = groupedServices[folderPath][groupName];
      for (const subPath of Object.keys(group)) {
        const item = group[subPath];
        getServiceHttpFunction(objectProperty, 'GET', subPath, item.get);
        getServiceHttpFunction(objectProperty, 'DELETE', subPath, item.delete);
        getServiceHttpFunction(objectProperty, 'HEAD', subPath, item.head);
        getServiceHttpFunction(objectProperty, 'OPTIONS', subPath, item.options);
        getServiceHttpFunction(objectProperty, 'PATCH', subPath, item.patch);
        getServiceHttpFunction(objectProperty, 'TRACE', subPath, item.trace);
        getServiceHttpFunction(objectProperty, 'PUT', subPath, item.put);
        getServiceHttpFunction(objectProperty, 'POST', subPath, item.post);
      }

      renderServiceClass(objectProperty);
    }
  }
};
