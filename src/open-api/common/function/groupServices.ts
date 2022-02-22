import { IPaths } from '../../interface/open-api-mine/i-paths';
import { IPathItem } from '../../interface/open-api-mine/i-path-item';

export const groupServices = (paths: IPaths): { [folderPath: string]: { [serviceName: string]: IPaths } } => {
  const result: { [folderPath: string]: { [serviceName: string]: IPaths } } = {};
  const pathsEntries = Object.entries(paths);
  const hasAnySecurity = hasSecurity(pathsEntries);

  for (const [path, methods] of pathsEntries) {
    const buildServiceName = path.split('/').filter((v) => !!v)[0];
    for (const [method, methodDefinition] of Object.entries(methods)) {
      const hasSecurity = !!methodDefinition.security;

      let folderPath = '';
      if (hasAnySecurity) {
        folderPath = hasSecurity ? 'auth' : 'no-auth';
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

const hasSecurity = (pathEntries: Array<[string, IPathItem]>): boolean => {
  return pathEntries.some(([, item]) => Object.entries(item).some(([, definition]) => !!definition.security));
};
