import * as nodePath from "path";
import { copyFileSync } from "fs";
import {Configuration} from "./config";

export const copyResources = (configuration: Configuration) => {
    const folder = configuration.getFolderManager();
    const iAjaxInterface = nodePath.join(__dirname, '..', 'static', 'interface', 'i-$-open-api.ts');
    const httpFunction = nodePath.join(__dirname, '..', 'static', 'function', `http-${configuration.getProviderName()}.ts`);
    const queryFunction = nodePath.join(__dirname, '..', 'static', 'function', 'get-query-params.ts');
    const openApiFunction = nodePath.join(__dirname, '..', 'static', 'function', 'open-api.ts');

    copyFileSync(httpFunction, nodePath.join(folder.getFunctionFolder(), 'http.ts'));
    copyFileSync(queryFunction, nodePath.join(folder.getFunctionFolder(), 'get-query-params.ts'));
    copyFileSync(openApiFunction, nodePath.join(folder.getFunctionFolder(), 'open-api.ts'));
    copyFileSync(iAjaxInterface, nodePath.join(folder.getInterfaceFolder(), 'i-$-open-api.ts'));
}
