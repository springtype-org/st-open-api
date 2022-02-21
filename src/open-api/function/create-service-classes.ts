import * as fs from 'fs';
import * as nodePath from 'path';
import { orderedPath } from './ordered-path';
import { IOpenApi } from '../interface/open-api-mine/i-open-api';
import { getServiceHttpFunction } from './get-service-http-function';
import { ObjectProperty } from '../classes/object-property';
import { GROUP_NO_AUTH_SERVICE, GROUP_SERVICE } from '../classes/register';
import { configuration } from './config';

const renderServiceClass = (objectProperty: ObjectProperty, subPath: 'auth' | 'no-auth') => {
  if (objectProperty.functions.length > 0) {
    const folder = configuration.getFolderManager();
    const reference = configuration.getReference();

    const hasSecurity = subPath === 'auth';
    const serviceFolder = hasSecurity ? folder.getAuthServiceFolder() : folder.getNoAuthServiceFolder();
    const rendered = objectProperty.render();
    reference.addReference(
      `service/${subPath}/${objectProperty.className}`,
      {
        className: rendered.classEnumName,
        fileName: rendered.fileName,
        folderPath: serviceFolder,
      },
      hasSecurity ? GROUP_SERVICE : GROUP_NO_AUTH_SERVICE,
    );

    fs.appendFileSync(nodePath.join(serviceFolder, `${rendered.fileName}.ts`), rendered.render);
  }
};
export const createServiceClasses = (openApi: IOpenApi) => {
  const orderedPaths = orderedPath(openApi);
  configuration.getGroupServiceFn()(openApi.paths);

  for (const groupName of Object.keys(orderedPaths)) {
    const className = groupName.charAt(0).toUpperCase() + groupName.slice(1);
    const group = orderedPaths[groupName];
    const objectPropertyAuth = new ObjectProperty(className, 'service/auth/', 'service/auth/', group);
    const objectPropertyNoAuth = new ObjectProperty(className, 'service/no-auth/', 'service/no-auth/', group);

    for (const subPath of Object.keys(group)) {
      const item = group[subPath];
      getServiceHttpFunction(objectPropertyAuth, objectPropertyNoAuth, 'GET', subPath, item.get);
      getServiceHttpFunction(objectPropertyAuth, objectPropertyNoAuth, 'DELETE', subPath, item.delete);
      getServiceHttpFunction(objectPropertyAuth, objectPropertyNoAuth, 'HEAD', subPath, item.head);
      getServiceHttpFunction(objectPropertyAuth, objectPropertyNoAuth, 'OPTIONS', subPath, item.options);
      getServiceHttpFunction(objectPropertyAuth, objectPropertyNoAuth, 'PATCH', subPath, item.patch);
      getServiceHttpFunction(objectPropertyAuth, objectPropertyNoAuth, 'TRACE', subPath, item.trace);
      getServiceHttpFunction(objectPropertyAuth, objectPropertyNoAuth, 'PUT', subPath, item.put);
      getServiceHttpFunction(objectPropertyAuth, objectPropertyNoAuth, 'POST', subPath, item.post);
    }
    renderServiceClass(objectPropertyAuth, 'auth');
    renderServiceClass(objectPropertyNoAuth, 'no-auth');
  }
};
