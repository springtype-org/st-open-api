import { IPaths } from '../../interface/open-api-mine/i-paths';

export const groupServices = (paths: IPaths): { [groupName: string]: IPaths } => {
  const result: { [groupName: string]: IPaths } = {};
  const pathEntries = Object.entries(paths);
  for (const [path, methods] of pathEntries) {
    for (const [method, methodDefinition] of Object.entries(methods)) {
      console.log('path', path, 'method', method, !!methodDefinition.sequrity);
    }
  }
  return result;
};
