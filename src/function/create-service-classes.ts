import *as fs from "fs";
import *as nodePath from "path";
import {orderedPath} from "./ordered-path";
import {IOpenApi} from "../interface/open-api-mine/i-open-api";
import {getServiceHttpFunction} from "./get-service-http-function";
import {ObjectProperty} from "../classes/object-property";
import {GROUP_SERVICE} from "../classes/ref";
import {configuration} from "./config";

export const createServiceClasses = (openApi: IOpenApi) => {
    const orderedPaths = orderedPath(openApi);
    const folder = configuration.getFolderManager();
    const reference = configuration.getReference();

    for (const groupName of Object.keys(orderedPaths)) {
        const className = groupName.charAt(0).toUpperCase() + groupName.slice(1)

        const group = orderedPaths[groupName];
        const objectProperty = new ObjectProperty(className);

        for (const subPath of Object.keys(group)) {
            const item = group[subPath];
            getServiceHttpFunction(objectProperty, 'GET', subPath, item.get);
            getServiceHttpFunction(objectProperty, 'DELETE', subPath, item.delete);
            getServiceHttpFunction(objectProperty, 'HEAD', subPath, item.head);
            getServiceHttpFunction(objectProperty, 'OPTIONS', subPath, item.options);
            getServiceHttpFunction(objectProperty, 'PATCH', subPath, item.patch);
            getServiceHttpFunction(objectProperty, 'TRACE', subPath, item.trace);
            getServiceHttpFunction(objectProperty, 'PUT', subPath, item.put);
            getServiceHttpFunction(objectProperty, 'POST', subPath, item.post);
        }

        const rendered = objectProperty.render();
        reference.addReference(`service/${className}`, {
                className: rendered.classEnumName,
                fileName: rendered.fileName,
                folderPath: folder.getServiceFolder()
            },
            GROUP_SERVICE
        );

        fs.appendFileSync(nodePath.join(folder.getServiceFolder(), `${rendered.fileName}.ts`), rendered.render)

    }
}
