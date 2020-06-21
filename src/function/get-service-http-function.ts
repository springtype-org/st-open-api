import {IOperation} from "../interface/open-api-mine/i-operation";
import {getSortedParameter} from "./get-sorted-parameter";
import {createResponseInterfaces} from "./create-response-interfaces";
import {createRequestBodyInterfaces} from "./create-request-body-interfaces";
import {getInterfaceOrEnumFromSchema} from "./get-property";
import {ISchema} from "../interface/open-api-mine/i-schema";
import * as fs from "fs";
import * as nodePath from "path";
import {HTTP_FUNCTION_REF, IFunction, ObjectProperty, OPEN_API_FUNCTION_REF,} from "../classes/object-property";
import {IGenerateConfig} from "../interface/i-generate-config";
import {kebabCaseToCamel} from "./kebab-case-to-camel";
import {firstCharacterLower} from "./first-character-lower";

export const getServiceHttpFunction = (config: IGenerateConfig, objProperty: ObjectProperty, httpMethod: string, path: string, operation: IOperation) => {
    if (!!operation) {
        const functionName = getOperationId(httpMethod, path, operation.operationId)
        const requestBody = createRequestBodyInterfaces(config, functionName, operation.requestBody);
        const response = createResponseInterfaces(config, functionName, operation.responses);


        const sortedParameter = getSortedParameter(path, operation.parameters);
        const queryParameters = sortedParameter.params.query || {};
        const urlParameter = sortedParameter.params.path || {};


        const parameterClassName = `I${functionName.substring(0, 1).toUpperCase()}${functionName.substring(1)}Parameter`;

        const operationFunction: IFunction = {

            functionName: functionName,
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
            const classToRender = getInterfaceOrEnumFromSchema(config, parameterClassName, functionName, parameterObject, config.folder.getInterfaceParameterFolder());

            const rendered = classToRender.render();
            fs.appendFileSync(nodePath.join(config.folder.getInterfaceParameterFolder(), `${rendered.fileName}.ts`), rendered.render)
            const schemaName = `#/schema/parameter/${parameterClassName}`;

            config.ref.addReference(schemaName, {
                fileName: rendered.fileName,
                className: rendered.classEnumName,
                folderPath: config.folder.getInterfaceParameterFolder(),
            });

            //add import of Parameter
            operationFunction.imports.push(config.ref.getImportAndTypeByRef(schemaName, config.folder.getServiceFolder()).import);
        }

        objProperty.addImports(config.ref.getImportAndTypeByRef(HTTP_FUNCTION_REF(config.folder).refKey, config.folder.getServiceFolder()).import);
        objProperty.addImports(config.ref.getImportAndTypeByRef(OPEN_API_FUNCTION_REF(config.folder).refKey, config.folder.getServiceFolder()).import);
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
