import {ISchema} from "../interface/open-api-mine/i-schema";
import {IFunctionRequestBody} from "../classes/object-property";
import {IGenerateConfig} from "../interface/i-generate-config";
import {convertClassName} from "./convert-class-name";
import {getInterfaceOrEnumFromSchema} from "./get-property";
import {appendFileSync} from "fs";
import {join} from "path";

export const createRequestBodyInterfaces = (config: IGenerateConfig, operationId: string, requestBody: any): IFunctionRequestBody & { import?: string } => {
    if (!!requestBody) {
        const content = requestBody.content;
        let responseType = 'string';
        let isJson = false;
        let _import;
        if (!!content['application/json']) {
            isJson = true;
            const requestBody = content['application/json'].schema as ISchema;
            if (!!requestBody.$ref) {
                const importAndType = config.ref.getImportAndTypeByRef(requestBody.$ref, config.folder.getServiceFolder());
                responseType = importAndType.className;
                _import = importAndType.import;
            } else {
                //TODO: refactor me
                const schemaName = `${operationId}Request`
                const className = 'I' + convertClassName(schemaName)
                let interfaceOrEnumeration = getInterfaceOrEnumFromSchema(config, className, schemaName, requestBody, config.folder.getInterfaceRequestFolder())

                if (!!interfaceOrEnumeration) {
                    const rendered = interfaceOrEnumeration.render();
                    appendFileSync(join(config.folder.getInterfaceRequestFolder(), `${rendered.fileName}.ts`), rendered.render)
                    _import = interfaceOrEnumeration.fileName;
                    const refKey = `#/components/schemas/response/${schemaName}`
                    config.ref.addReference(refKey, {
                        fileName: interfaceOrEnumeration.fileName,
                        className: className,
                        folderPath: config.folder.getInterfaceRequestFolder()
                    });
                    const importAndType = config.ref.getImportAndTypeByRef(refKey, config.folder.getServiceFolder());

                    //TODO: fix this on higher level
                    responseType = requestBody.type === 'array' ? `Array<${importAndType.className}>` : importAndType.className;
                    _import = importAndType.import;
                }
            }
            return {
                isRequestBodyJson: isJson,
                import: _import,
                requestBodyClass: responseType
            }
        }
    }
    return {
        isRequestBodyJson: false
    }

}

