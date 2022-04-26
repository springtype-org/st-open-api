import { IPaths } from '../../interface/open-api-mine/i-paths';
import { IPathItem } from '../../interface/open-api-mine/i-path-item';
import * as nodePath from 'path';

export const groupServices = (paths: IPaths): { [folderPath: string]: { [serviceName: string]: IPaths } } => {
  const result: { [folderPath: string]: { [serviceName: string]: IPaths } } = {};
  const pathsEntries = Object.entries(paths);
  const isAnySecurity = hasAnySecurity(pathsEntries);
  const isAnyPathVersion = hasAnyPathsVersion(pathsEntries);

  for (const [path, methods] of pathsEntries) {
    const isPathVersion = hasPathVersion(path);
    const pathParts = path.split('/').filter((v) => !!v);
    const buildServiceName = pathParts[isPathVersion ? 1 : 0];
    for (const [method, methodDefinition] of Object.entries(methods)) {
      const isSecurity = hasSecurity(methodDefinition);

      let folderPath = '';
      if (isAnySecurity) {
        folderPath = isSecurity ? 'auth' : 'no-auth';
      }
      if (isAnyPathVersion && isPathVersion) {
        folderPath = nodePath.join(folderPath, pathParts[0]);
      }

      const serviceFolderPath = result[folderPath] || {};
      const service = serviceFolderPath[buildServiceName] || {};
      const servicePath = service[path] || {};
      serviceFolderPath[buildServiceName] = service;
      result[folderPath] = serviceFolderPath;
      service[path] = servicePath;
      servicePath[method] = methodDefinition;
    }
  }
  return result;
};

const hasAnySecurity = (pathEntries: Array<[string, IPathItem]>): boolean => {
  return pathEntries.some(([, item]) => Object.entries(item).some(([, definition]) => hasSecurity(definition)));
};

const hasSecurity = (methodDefinition: any): boolean => {
  return !!methodDefinition.security;
};

const hasAnyPathsVersion = (pathEntries: Array<[string, IPathItem]>): boolean => {
  return pathEntries.some(([path]) => hasPathVersion(path));
};

const hasPathVersion = (path: string): boolean => {
  const firstPartOfPath =
    path
      .toLowerCase()
      .split('/')
      .filter((p) => !!p)[0] || '';
  return /v[0-9]{1,2}/g.test(firstPartOfPath);
};
