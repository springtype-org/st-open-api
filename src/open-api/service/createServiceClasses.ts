import { configuration, Configuration } from '../function/config';
import { IPaths } from '../interface/open-api-mine/i-paths';
import { ObjectProperty } from '../classes/object-property';
import { renderServiceClass } from './renderServiceClass';
import { preparePaths } from './function/preparePaths';
import { getServiceHttpFunction } from './function/getServiceHttpFunction';

export const createServiceClasses = (paths: IPaths, config: Configuration = configuration) => {
  const preparedPaths = preparePaths(paths);
  const groupedServices = config.getGroupServiceFn()(preparedPaths);

  for (const folderPath of Object.keys(groupedServices)) {
    for (const groupName of Object.keys(groupedServices[folderPath])) {
      const className = config.getCreateServiceNameFn()(groupName);
      const objectProperty = new ObjectProperty(className, folderPath, 'SERVICE', groupName, config);
      const group = groupedServices[folderPath][groupName];
      for (const subPath of Object.keys(group)) {
        const item = group[subPath];
        getServiceHttpFunction(objectProperty, 'GET', subPath, item.get);
        getServiceHttpFunction(objectProperty, 'DELETE', subPath, item.delete);
        getServiceHttpFunction(objectProperty, 'PATCH', subPath, item.patch);
        getServiceHttpFunction(objectProperty, 'PUT', subPath, item.put);
        getServiceHttpFunction(objectProperty, 'POST', subPath, item.post);
        //getServiceHttpFunction(objectProperty, 'HEAD', subPath, item.head);
        //getServiceHttpFunction(objectProperty, 'OPTIONS', subPath, item.options);
        //getServiceHttpFunction(objectProperty, 'TRACE', subPath, item.trace);
      }
      renderServiceClass(objectProperty, config);
    }
  }
};
