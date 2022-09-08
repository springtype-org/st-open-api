import { join } from 'path';
import { copyFileSync } from 'fs';
import { Configuration } from '../classes/Configuration';

export const copyResources = (config: Configuration) => {
  const folder = config.getFolderManager();
  const openApiInterfaces = join(__dirname, '..', 'static', 'interface', 'open-api.ts');
  const httpFunction = join(__dirname, '..', 'static', 'function', 'http.ts');
  const openApiFunction = join(__dirname, '..', 'static', 'function', 'open-api.ts');

  // copyFileSync(httpFunction, join(folder.getFunctionFolder(), 'http.ts'));
  // copyFileSync(openApiFunction, join(folder.getFunctionFolder(), 'open-api.ts'));
  // copyFileSync(openApiInterfaces, join(folder.getInterfaceFolder(), 'open-api.ts'));
};
