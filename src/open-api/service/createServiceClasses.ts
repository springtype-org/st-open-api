import { Configuration } from '../classes/Configuration';
import { IPaths } from '../interface/open-api-mine/i-paths';
import { ObjectProperty } from '../classes/ObjectProperty';
import { renderServiceClass } from './renderServiceClass';
import { mergeParameters } from './function/preparePaths';
import { getServiceHttpFunction } from './function/getServiceHttpFunction';
import nodePath from 'path';

function getNonIgnoredPaths(paths: IPaths, config): IPaths {
  return Object.entries(paths).reduce((prev, [key, value]) => {
    if (value !== '/') {
      return { ...prev, [key]: value };
    }
    return prev;
  }, {});
}

export const createServiceClasses = (paths: IPaths, config: Configuration) => {
  const nonIgnoredPaths = getNonIgnoredPaths(paths, config);
  const preparedPaths = mergeParameters(nonIgnoredPaths);
  const groupedServices = config.getGroupServiceFn()(preparedPaths);

  for (const folderPath of Object.keys(groupedServices)) {
    for (const groupName of Object.keys(groupedServices[folderPath])) {
      const className = config.getCreateServiceNameFn()(groupName);
      const serviceFolderPath: string = nodePath.join(config.getFolderManager().getServiceFolder(), groupName);
      const objectProperty = new ObjectProperty(className, serviceFolderPath, 'SERVICE', groupName, config);
      const group = groupedServices[folderPath][groupName];
      for (const subPath of Object.keys(group)) {
        const item = group[subPath];
        getServiceHttpFunction(objectProperty, 'GET', subPath, item.get, config);
        getServiceHttpFunction(objectProperty, 'DELETE', subPath, item.delete, config);
        getServiceHttpFunction(objectProperty, 'PATCH', subPath, item.patch, config);
        getServiceHttpFunction(objectProperty, 'PUT', subPath, item.put, config);
        getServiceHttpFunction(objectProperty, 'POST', subPath, item.post, config);
      }
      renderServiceClass(objectProperty, config);
    }
  }
};
