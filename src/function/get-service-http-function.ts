import {IOperation} from "../interface/open-api-mine/i-operation";
import {getSortedParameter} from "./get-sorted-parameter";
import {createResponseInterfaces} from "./create-response-interfaces";
import {createRequestBodyInterfaces} from "./create-request-body-interfaces";
import {getInterfaceOrEnumFromSchema} from "./get-property";
import {ISchema} from "../interface/open-api-mine/i-schema";
import * as fs from "fs";
import * as nodePath from "path";
import {
    HTTP_ERROR_HANDLER_INTERFACE_REF,
    HTTP_FUNCTION_REF,
    HTTP_REQUEST_INTERCEPTOR_INTERFACE_REF,
    IFunction,
    ObjectProperty,
    OPEN_API_FUNCTION_REF,
} from "../classes/object-property";
import {kebabCaseToCamel} from "./kebab-case-to-camel";
import {firstCharacterLower} from "./first-character-lower";
import {configuration} from "./config";

export const getServiceHttpFunction = (objProperty: ObjectProperty, httpMethod: string, path: string, operation: IOperation) => {
    const reference = configuration.getReference();
    const folder = configuration.getFolderManager();

    if (!!operation) {
        const functionName = getOperationId(httpMethod, path, operation.operationId)
        const requestBody = createRequestBodyInterfaces(functionName, operation.requestBody);
        const response = createResponseInterfaces(functionName, operation.responses);

        const sortedParameter = getSortedParameter(path, operation.parameters);
        const queryParameters = sortedParameter.params.query || {};
        const urlParameter = sortedParameter.params.path || {};


        const parameterClassName = `I${functionName.substring(0, 1).toUpperCase()}${functionName.substring(1)}Parameter`;

        const operationFunction: IFunction = {

            functionName: functionName,
            forceInterceptor: configuration.forceInterceptor(),
            imports: [],

            httpMethod: httpMethod,
            originalPath: path,
            urlParameter: Object.keys(urlParameter),

            description: operation.description,
            queryParameters: Object.keys(queryParameters),

            ...requestBody,
            ...response
        }
        operationFunction.imports.push(requestBody.import);
        operationFunction.imports.push(response.import);


        if (sortedParameter.isParameter) {
            operationFunction.parameterClassName = parameterClassName;

            const parameterObject: ISchema = {
                type: 'object',
                required: [],
                properties: {}
            }
            operation.parameters.forEach(p => {
                if (p.required) {
                    parameterObject.required.push(p.name);
                }
                parameterObject.properties[p.name] = p.schema;
            });

            const classToRender = getInterfaceOrEnumFromSchema(parameterClassName, functionName, parameterObject, folder.getInterfaceParameterFolder());

            const rendered = classToRender.render();
            fs.appendFileSync(nodePath.join(folder.getInterfaceParameterFolder(), `${rendered.fileName}.ts`), rendered.render)
            const schemaName = `#/schema/parameter/${parameterClassName}`;

            reference.addReference(schemaName, {
                fileName: rendered.fileName,
                className: rendered.classEnumName,
                folderPath: folder.getInterfaceParameterFolder(),
            });

            //add import of Parameter
            operationFunction.imports.push(reference.getImportAndTypeByRef(schemaName, folder.getServiceFolder()).import);
        }

        [
            HTTP_FUNCTION_REF,
            HTTP_REQUEST_INTERCEPTOR_INTERFACE_REF,
            HTTP_ERROR_HANDLER_INTERFACE_REF,
            OPEN_API_FUNCTION_REF,
        ]
            .map(fun => fun(folder))
            .map(httpRef =>
                reference.getImportAndTypeByRef(httpRef.refKey, folder.getServiceFolder())
            )
            .forEach(refResult => objProperty.addImports(refResult.import))

        objProperty.addFunction(operationFunction);
    }
}

const getOperationId = (httpMethod: string, path: string, operationId: string | undefined): string => {
    if (!!operationId) {
        return firstCharacterLower(kebabCaseToCamel(operationId.replace('_', '-')));
    }
    const newPath = path.split('/').filter(p => !!p)
        .map(p => {
            if (p.startsWith('{') && p.endsWith('}')) {
                return `By${p.substring(0, 1).toUpperCase()}${p.substring(2)}`
            }
            return p.substring(0, 1).toUpperCase() + p.substring(1);
        }).join('');
    return `${httpMethod.toUpperCase()}${newPath}`
}
