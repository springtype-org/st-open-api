import * as nodePath from "path";
import * as fs from "fs";
import {configuration} from "./config";

export const copyResources = () => {
    const folder = configuration.getFolderManager();
    const iAjaxInterface = nodePath.join(__dirname, '..', 'static', 'interface', 'i-$-open-api.ts');
    const httpFunction = nodePath.join(__dirname, '..', 'static', 'function', 'http.ts');
    const queryFunction = nodePath.join(__dirname, '..', 'static', 'function', 'get-query-params.ts');
    const openApiFunction = nodePath.join(__dirname, '..', 'static', 'function', 'open-api.ts');

    fs.copyFileSync(httpFunction, nodePath.join(folder.getFunctionFolder(), 'http.ts'));
    fs.copyFileSync(queryFunction, nodePath.join(folder.getFunctionFolder(), 'get-query-params.ts'));
    fs.copyFileSync(openApiFunction, nodePath.join(folder.getFunctionFolder(), 'open-api.ts'));
    fs.copyFileSync(iAjaxInterface, nodePath.join(folder.getInterfaceFolder(), 'i-$-open-api.ts'));
}
