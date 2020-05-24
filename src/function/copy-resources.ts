import * as nodePath from "path";
import * as fs from "fs";
import {IGenerateConfig} from "../interface/i-generate-config";

export const copyResources = (config: IGenerateConfig) => {
    const folder = config.folder;
    const iAjaxInterface = nodePath.join(process.cwd(), 'static', 'interface', 'i-$-open-api.ts');
    const httpFunction = nodePath.join(process.cwd(), 'static', 'function', 'http.ts');
    const queryFunction = nodePath.join(process.cwd(), 'static', 'function', 'get-query-params.ts');
    const openApiFunction = nodePath.join(process.cwd(), 'static', 'function', 'open-api.ts');

    fs.copyFileSync(httpFunction, nodePath.join(folder.getFunctionFolder(), 'http.ts'));
    fs.copyFileSync(queryFunction, nodePath.join(folder.getFunctionFolder(), 'get-query-params.ts'));
    fs.copyFileSync(openApiFunction, nodePath.join(folder.getFunctionFolder(), 'open-api.ts'));
    fs.copyFileSync(iAjaxInterface, nodePath.join(folder.getInterfaceFolder(), 'i-$-open-api.ts'));
}