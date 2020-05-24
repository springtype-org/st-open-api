import {ISchema} from "../interface/open-api-mine/i-schema";
import {IFunctionRequestBody} from "../classes/object-property";
import {IGenerateConfig} from "../interface/i-generate-config";

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
                //TODO: build own response interface classes
                console.log('property nested classes');
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

