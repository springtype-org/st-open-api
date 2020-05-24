import *as fs from "fs";
import *as nodePath from "path";
import {orderedPath} from "./ordered-path";
import {IOpenApi} from "../interface/open-api-mine/i-open-api";
import {getServiceHttpFunction} from "./get-service-http-function";
import {Ref} from "../classes/ref";
import {HTTP_FUNCTION_REF, ObjectProperty} from "../classes/object-property";
import {FolderManager} from "../classes/folder-manager";
import {IGenerateConfig} from "../interface/i-generate-config";

export const createServiceClasses = (config: IGenerateConfig, openApi: IOpenApi) => {
    const orderedPaths = orderedPath(openApi);
const {folder,useSpringtype, ref} = config;
    for (const groupName of Object.keys(orderedPaths)) {
        const className = groupName.charAt(0).toUpperCase() + groupName.slice(1) + 'Service'

        const group = orderedPaths[groupName];
        const objectProperty = new ObjectProperty(className,config.useSpringtype);

        for (const subPath of Object.keys(group)) {
            const item = group[subPath];
            getServiceHttpFunction(config, objectProperty, 'GET', subPath, item.get);
            getServiceHttpFunction(config, objectProperty, 'DELETE', subPath, item.delete);
            getServiceHttpFunction(config, objectProperty, 'HEAD', subPath, item.head);
            getServiceHttpFunction(config, objectProperty, 'OPTIONS', subPath, item.options);
            getServiceHttpFunction(config, objectProperty, 'PATCH', subPath, item.patch);
            getServiceHttpFunction(config, objectProperty, 'TRACE', subPath, item.trace);
            getServiceHttpFunction(config, objectProperty, 'PUT', subPath, item.put);
            getServiceHttpFunction(config, objectProperty, 'POST', subPath, item.post);
        }

        if (useSpringtype) {
            objectProperty.addImports(ref.getImportAndTypeByRef(HTTP_FUNCTION_REF(folder).refKey, folder.getServiceFolder()).import);
        }



        const rendered = objectProperty.render();
        fs.appendFileSync(nodePath.join(folder.getServiceFolder(), `${rendered.fileName}.ts`), rendered.render)

    }
}
