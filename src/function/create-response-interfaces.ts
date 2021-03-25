import {ISchema} from "../interface/open-api-mine/i-schema";
import {IFunctionResponse} from "../classes/object-property";
import {getInterfaceOrEnumFromSchema} from "./get-property";
import {appendFileSync} from "fs";
import {join} from "path";
import {configuration} from "./config";
import {formatText} from "./formatText";

export const createResponseInterfaces = (operationId: string, responses: any): IFunctionResponse & { import?: string } => {
    const reference = configuration.getReference();
    const folder = configuration.getFolderManager();

    const success = responses['200'] || responses['201'];

    // TODO: Refactor me !!!
    if (!!success && !!success.content) {
        const successContent = success.content;
        let isJson = false;
        let responseType = 'string';
        let _import;

        const isPlaintext = !!successContent['text/plain'];

        if (!!successContent['application/json']) {
            isJson = true;
            const responseSchema = success.content['application/json'].schema as ISchema;
            if (responseSchema.$ref) {
                const importAndType = reference.getImportAndTypeByRef(responseSchema.$ref, folder.getServiceFolder());
                responseType = importAndType.className;
                _import = importAndType.import;
            } else {
                const schemaName = `${operationId}Response`
                const className = 'I' + formatText(schemaName, 'ANY', 'PascalCase')
                let interfaceOrEnumeration = getInterfaceOrEnumFromSchema(className, schemaName, responseSchema, folder.getInterfaceResponseFolder())

                if (!!interfaceOrEnumeration) {
                    const rendered = interfaceOrEnumeration.render();
                    appendFileSync(join(folder.getInterfaceResponseFolder(), `${rendered.fileName}.ts`), rendered.render)
                    _import = interfaceOrEnumeration.fileName;
                    const refKey = `#/components/schemas/response/${schemaName}`
                    reference.addReference(refKey, {
                        fileName: interfaceOrEnumeration.fileName,
                        className: className,
                        folderPath: folder.getInterfaceResponseFolder()
                    });
                    const importAndType = reference.getImportAndTypeByRef(refKey, folder.getServiceFolder());

                    responseType = importAndType.className;
                    importAndType.className;
                    _import = importAndType.import;
                }
            }
        }
        return {
            responseClass: responseType,
            isJsonResponse: isJson,
            isPlaintextResponse: isPlaintext,
            import: _import,
        }
    } else {
        return {
            isJsonResponse: false,
            isPlaintextResponse: false,
        }
    }
}

