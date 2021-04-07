import * as nodePath from 'path';
import * as fs from 'fs';
import { configuration } from './config';

export const copyResources = () => {
  const folder = configuration.getFolderManager();
  const openApiInterfaces = nodePath.join(__dirname, '..', 'static', 'interface', 'open-api.ts');
  const httpFunction = nodePath.join(__dirname, '..', 'static', 'function', 'http.ts');
  const openApiFunction = nodePath.join(__dirname, '..', 'static', 'function', 'open-api.ts');

  fs.copyFileSync(httpFunction, nodePath.join(folder.getFunctionFolder(), 'http.ts'));
  fs.copyFileSync(openApiFunction, nodePath.join(folder.getFunctionFolder(), 'open-api.ts'));
  fs.copyFileSync(openApiInterfaces, nodePath.join(folder.getInterfaceFolder(), 'open-api.ts'));
};
