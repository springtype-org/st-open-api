import {ISchema} from "../interface/open-api-mine/i-schema";
import {IFunctionResponse} from "../classes/object-property";
import {IGenerateConfig} from "../interface/i-generate-config";
import {getInterfaceOrEnumFromSchema} from "./get-property";
import {convertClassName} from "./convert-class-name";
import {appendFileSync} from "fs";
import {join} from "path";

export const createResponseInterfaces = (config: IGenerateConfig, operationId: string, responses: any): IFunctionResponse & { import?: string } => {
    const success = responses['200'];
    if (!!success && !!success.content) {
        const successContent = success.content;
        let isJson = false;
        let responseType = 'string';
        let _import;
        if (!!successContent['application/json']) {
            isJson = true;
            const responseSchema = success.content['application/json'].schema as ISchema;
            if (responseSchema.$ref) {
                const importAndType = config.ref.getImportAndTypeByRef(responseSchema.$ref, config.folder.getServiceFolder());
                responseType = importAndType.className;
                _import = importAndType.import;
            } else {
                //TODO: refactor me
                const schemaName = `${operationId}Response`
                const className = 'I' + convertClassName(schemaName)
                let interfaceOrEnumeration = getInterfaceOrEnumFromSchema(config, className, schemaName, responseSchema, config.folder.getInterfaceResponseFolder())

                if (!!interfaceOrEnumeration) {
                    const rendered = interfaceOrEnumeration.render();
                    appendFileSync(join(config.folder.getInterfaceResponseFolder(), `${rendered.fileName}.ts`), rendered.render)
                    _import = interfaceOrEnumeration.fileName;
                    const refKey = `#/components/schemas/response/${schemaName}`
                    config.ref.addReference(refKey, {
                        fileName: interfaceOrEnumeration.fileName,
                        className: className,
                        folderPath: config.folder.getInterfaceResponseFolder()
                    });
                    const importAndType = config.ref.getImportAndTypeByRef(refKey, config.folder.getServiceFolder());

                    //TODO: fix this on higher level in mustache template
                    responseType = responseSchema.type === 'array' ? `Array<${importAndType.className}>` : importAndType.className;
                    importAndType.className;
                    _import = importAndType.import;
                }
            }
        }
        return {
            responseClass: responseType,
            isJsonResponse: isJson,
            import: _import,
        }
    } else {
        return {
            isJsonResponse: false
        }
    }
}

