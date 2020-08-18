import *as fs from "fs";
import *as nodePath from "path";
import {orderedPath} from "./ordered-path";
import {IOpenApi} from "../interface/open-api-mine/i-open-api";
import {getServiceHttpFunction} from "./get-service-http-function";
import {ObjectProperty} from "../classes/object-property";
import {IGenerateConfig} from "../interface/i-generate-config";
import {GROUP_SERVICE} from "../classes/ref";

export const createServiceClasses = (config: IGenerateConfig, openApi: IOpenApi) => {
    const orderedPaths = orderedPath(openApi, config);
    const {folder, ref} = config;
    for (const groupName of Object.keys(orderedPaths)) {
        const className = groupName.charAt(0).toUpperCase() + groupName.slice(1)

        const group = orderedPaths[groupName];
        const objectProperty = new ObjectProperty(className);

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

        const rendered = objectProperty.render();
        ref.addReference(`service/${className}`, {
                className: rendered.classEnumName,
                fileName: rendered.fileName,
                folderPath: folder.getServiceFolder()
            },
            GROUP_SERVICE
        );

        fs.appendFileSync(nodePath.join(folder.getServiceFolder(), `${rendered.fileName}.ts`), rendered.render)

    }
}
