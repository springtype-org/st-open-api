import {IComponents} from "../interface/open-api-mine/i-components";
import {appendFileSync} from "fs";
import {join} from "path";

import {camelToKebabCase} from "./camel-to-kebab-case";
import {ISchema} from "../interface/open-api-mine/i-schema";
import {getInterfaceOrEnumFromSchema} from "./get-property";
import {convertClassName} from "./convert-class-name";
import {configuration} from "./config";


export const createComponentInterfaces = (components: IComponents) => {
    const isDebug = configuration.isDebug();
    const reference = configuration.getReference();
    const folderManager = configuration.getFolderManager();

    if (components && components.schemas) {
        if (isDebug) {
            console.log(`Create component Interfaces`)
        }
        const schemas = components.schemas;
        for (const schemaName of Object.keys(schemas)) {
            const className = 'I' + convertClassName(schemaName);
            const fileName = camelToKebabCase(className);


            reference.addReference(`#/components/schemas/${schemaName}`, {
                fileName: fileName,
                className: className,
                folderPath: folderManager.getInterfaceComponentsFolder()
            });
            if (isDebug) {
                console.log(`Add new reference ${className} -> ${fileName}`)
            }
        }
        for (const schemaName of Object.keys(schemas)) {
            const schema = schemas[schemaName] as ISchema;
            if (isDebug) {
                console.log(`Create interface ${schemaName}`)
                console.log(`Schema  ${schemaName}`, JSON.stringify(schema, null, 2))
            }
            let interfaceOrEnumeration = getInterfaceOrEnumFromSchema('I' + convertClassName(schemaName), schemaName, schema, folderManager.getInterfaceComponentsFolder());
            if (!!interfaceOrEnumeration) {
                const rendered = interfaceOrEnumeration.render();
                appendFileSync(join(folderManager.getInterfaceComponentsFolder(), `${rendered.fileName}.ts`), rendered.render)
            }
            if (isDebug) {
                console.log(`Finish interface ${schemaName} creation`)
            }
        }
        if (isDebug) {
            console.log(`Finish component interface creation`)
        }
    }
}
