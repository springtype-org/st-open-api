import {IComponents} from "../interface/open-api-mine/i-components";
import {appendFileSync} from "fs";
import {join} from "path";

import {camelToKebabCase} from "./camel-to-kebab-case";
import {ISchema} from "../interface/open-api-mine/i-schema";
import {getInterfaceOrEnumFromSchema} from "./get-property";
import {IGenerateConfig} from "../interface/i-generate-config";
import {convertClassName} from "./convert-class-name";


export const createComponentInterfaces = (config: IGenerateConfig, components: IComponents) => {
    if (components && components.schemas) {
        if (config.verbose) {
            console.log(`Create component Interfaces`)
        }
        const schemas = components.schemas;
        const {ref, folder} = config;
        for (const schemaName of Object.keys(schemas)) {
            const className = 'I' + convertClassName(schemaName);
            const fileName = camelToKebabCase(className);

            ref.addReference(`#/components/schemas/${schemaName}`, {
                fileName: fileName,
                className: className,
                folderPath: folder.getInterfaceComponentsFolder()
            });
            if (config.verbose) {
                console.log(`Add new reference ${className} -> ${fileName}`)
            }
        }
        for (const schemaName of Object.keys(schemas)) {
            const schema = schemas[schemaName] as ISchema;
            if (config.verbose) {
                console.log(`Create interface ${schemaName}`)
                console.log(`Schema  ${schemaName}`, JSON.stringify(schema, null, 2))
            }
            let interfaceOrEnumeration = getInterfaceOrEnumFromSchema(config, 'I' + convertClassName(schemaName), schemaName, schema, folder.getInterfaceComponentsFolder());
            if (!!interfaceOrEnumeration) {
                const rendered = interfaceOrEnumeration.render();
                appendFileSync(join(folder.getInterfaceComponentsFolder(), `${rendered.fileName}.ts`), rendered.render)
            }
            if (config.verbose) {
                console.log(`Finish interface ${schemaName} creation`)
            }
        }
        if (config.verbose) {
            console.log(`Finish component interface creation`)
        }
    }
}
