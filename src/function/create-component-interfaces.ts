import {IComponents} from "../interface/open-api-mine/i-components";
import * as fs from "fs";
import * as nodePath from "path";
import {camelToKebabCase} from "./camel-to-kebab-case";
import {ISchema} from "../interface/open-api-mine/i-schema";
import {getObjectOrEnumFromSchema} from "./get-propery";
import {IGenerateConfig} from "../interface/i-generate-config";


export const createComponentInterfaces = (config: IGenerateConfig, components: IComponents) => {

    const schemas = components.schemas;
    const {ref, folder} = config;
    for (const schemaName of Object.keys(schemas)) {
        const className = 'I' + schemaName.substring(0, 1).toUpperCase() + schemaName.substring(1);
        ref.addReference(`#/components/schemas/${schemaName}`, {
            fileName: camelToKebabCase(className),
            className: className,
            folderPath: folder.getInterfaceComponentsFolder()
        });
    }
    for (const schemaName of Object.keys(schemas)) {

        const schema = schemas[schemaName] as ISchema;

        let classOrEnumeration = getObjectOrEnumFromSchema(config, 'I' + schemaName, schemaName, schema, folder.getInterfaceComponentsFolder());

        if (!!classOrEnumeration) {
            const rendered = classOrEnumeration.render();
            fs.appendFileSync(nodePath.join(folder.getInterfaceComponentsFolder(), `${rendered.fileName}.ts`), rendered.render)
        }
    }
}