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
    HTTP_RESPONSE_INTERCEPTOR_INTERFACE_REF,
    IFunction,
    ObjectProperty,
    OPEN_API_FUNCTION_REF,
} from "../classes/object-property";
import {kebabCaseToCamel} from "./kebab-case-to-camel";
import {firstCharacterLower} from "./first-character-lower";
import {configuration} from "./config";
import {formatText} from "./formatText";
import {IParameter} from "../interface/open-api-mine/i-parameter";
import {IRefResult} from "../classes/ref";
import { IHeaderParameter } from "../interface/i-header-parameter";

type CreateParameterArguments = 
    {
        type: 'query' | 'path' | 'cookie',
        functionName: string,
        parameters: { [parameterName: string]: IParameter }
    } | {
        type: 'header',
        functionName: string,
        parameters: { [parameterName: string]: IHeaderParameter }
    }

const createParameter = ({type, functionName, parameters}: CreateParameterArguments): IRefResult => {
    const parameterClassName = `I${functionName.substring(0, 1).toUpperCase()}${functionName.substring(1)}${type.substring(0, 1).toUpperCase()}${type.substring(1)}Parameter`;

    const reference = configuration.getReference();
    const folder = configuration.getFolderManager();

    const parameterObject: ISchema = {
        type: 'object',
        required: [],
        properties: {}
    }
    Object.values(parameters).forEach(p => {

        // HTTP authorization header shall be added via interceptor,
        // not be necessary to be provided for every single request
        if (p.name === 'authorization' && type === 'header') return;

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

    return reference.getImportAndTypeByRef(schemaName, folder.getServiceFolder());
}

export const getServiceHttpFunction = (objProperty: ObjectProperty, httpMethod: string, path: string, operation: IOperation) => {
    const reference = configuration.getReference();
    const folder = configuration.getFolderManager();

    if (!!operation) {
        const functionName = getOperationId(httpMethod, path, operation.operationId)
        const requestBody = createRequestBodyInterfaces(functionName, operation.requestBody);
        const response = createResponseInterfaces(functionName, operation.responses);

        const sortedParameter = getSortedParameter(path, operation.parameters);

        const operationFunction: IFunction = {

            functionName: functionName,
            forceInterceptor: configuration.forceInterceptor(),
            imports: [],

            httpMethod: httpMethod,
            originalPath: path,

            description: operation.description,

            ...requestBody,
            ...response
        }
        operationFunction.imports.push(requestBody.import);
        operationFunction.imports.push(response.import);

        if (Object.keys(sortedParameter.query).length > 0) {
            const {className, import: importString} = createParameter({type: 'query', functionName, parameters: sortedParameter.query})
            operationFunction.queryParameters = {className, params: Object.keys(sortedParameter.query)};
            operationFunction.imports.push(importString);
        }

        if (Object.keys(sortedParameter.header).length > 0) {
            const {className, import: importString} = createParameter({type: 'header', functionName, parameters: sortedParameter.header})
            operationFunction.headerParameters = {className, params: sortedParameter.header};
            operationFunction.imports.push(importString);
        }

        if (Object.keys(sortedParameter.path).length > 0) {
            const {className, import: importString} = createParameter({type: 'path', functionName, parameters: sortedParameter.path})
            operationFunction.pathParameters = {className, params: Object.keys(sortedParameter.path)};
            operationFunction.imports.push(importString);
        }

        [
            HTTP_FUNCTION_REF,
            HTTP_REQUEST_INTERCEPTOR_INTERFACE_REF,
            HTTP_RESPONSE_INTERCEPTOR_INTERFACE_REF,
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
            if (p.startsWith('{')) {
                return 'By' + p.substr(1, 1).toUpperCase() + p.substr(2)
            }
            return p
        }).map(p => {
            if (p.endsWith('}')) {
                return p.substr(0, p.length - 1)
            }
            return p
        })
        .map(p => {
            return formatText(p, 'ANY', 'PascalCase');
        }).join('');
    return `${httpMethod.toLowerCase()}${newPath}`
}
