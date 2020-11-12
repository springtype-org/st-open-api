import {ISchema} from "../interface/open-api-mine/i-schema";
import {IFunctionRequestBody} from "../classes/object-property";
import {getInterfaceOrEnumFromSchema} from "./get-property";
import {appendFileSync} from "fs";
import {join} from "path";
import {configuration} from "./config";
import {formatText} from "./formatText";

export const createRequestBodyInterfaces = (operationId: string, requestBody: any): IFunctionRequestBody & { import?: string } => {
    const reference = configuration.getReference();
    const folder = configuration.getFolderManager();
    if (!!requestBody) {
        const content = requestBody.content;
        let responseType = 'string';
        let isJson = false;
        let _import;
        if (!!content['application/json']) {
            isJson = true;
            const requestBody = content['application/json'].schema as ISchema;
            if (!!requestBody.$ref) {
                const importAndType = reference.getImportAndTypeByRef(requestBody.$ref, folder.getServiceFolder());
                responseType = importAndType.className;
                _import = importAndType.import;
            } else {
                //TODO: refactor me
                const schemaName = `${operationId}Request`
                const className = 'I' + formatText(schemaName, 'ANY', 'PascalCase')
                let interfaceOrEnumeration = getInterfaceOrEnumFromSchema(className, schemaName, requestBody, folder.getInterfaceRequestFolder())

                if (!!interfaceOrEnumeration) {
                    const rendered = interfaceOrEnumeration.render();
                    appendFileSync(join(folder.getInterfaceRequestFolder(), `${rendered.fileName}.ts`), rendered.render)
                    _import = interfaceOrEnumeration.fileName;
                    const refKey = `#/components/schemas/response/${schemaName}`
                    reference.addReference(refKey, {
                        fileName: interfaceOrEnumeration.fileName,
                        className: className,
                        folderPath: folder.getInterfaceRequestFolder()
                    });
                    const importAndType = reference.getImportAndTypeByRef(refKey, folder.getServiceFolder());

                    responseType = importAndType.className;
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

