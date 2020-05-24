import {ISchema} from "../interface/open-api-mine/i-schema";
import {IFunctionResponse} from "../classes/object-property";
import {IGenerateConfig} from "../interface/i-generate-config";

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
            if (!!responseSchema.$ref) {
                const importAndType = config.ref.getImportAndTypeByRef(responseSchema.$ref, config.folder.getServiceFolder());
                responseType = importAndType.className;
                _import = importAndType.import;
            } else {
                //TODO: build own response interface classes
                console.log(' nested classes');
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

