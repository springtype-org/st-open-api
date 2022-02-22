import { configuration, Configuration } from '../function/config';
import { IPaths } from '../interface/open-api-mine/i-paths';
import { ObjectProperty } from '../classes/object-property';
import { renderServiceClass } from './renderServiceClass';
import { getServiceHttpFunction } from '../function/get-service-http-function';

export const createServiceClasses = (paths: IPaths, config: Configuration = configuration) => {
  const groupedServices = config.getGroupServiceFn()(paths);
  for (const folderPath of Object.keys(groupedServices)) {
    for (const groupName of Object.keys(groupedServices[folderPath])) {
      const className = config.getCreateServiceNameFn()(groupName);
      const objectProperty = new ObjectProperty(className, folderPath, 'SERVICE', groupName, config);
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

      renderServiceClass(objectProperty, config);
    }
  }
};
