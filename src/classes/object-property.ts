import {IPropertyClass, IRenderResult} from "../interface/i-property-class";
import {renderMustache} from "../function/render-mustache";
import {UniqueArray} from "./unique-array";
import {splitByLineBreak} from "../function/split-by-line-break";
import {FolderManager} from "./folder-manager";
import {formatText} from "../function/formatText";
import { IHeaderParameter } from "../interface/i-header-parameter";

export const HTTP_FUNCTION_REF = (folder: FolderManager) => {
    return {
        fileName: "http",
        refKey: "HTTP_FUNCTION_REF",
        className: "http",
        folderPath: folder.getFunctionFolder()
    }
}

export const HTTP_REQUEST_INTERCEPTOR_INTERFACE_REF = (folder: FolderManager) => {
    return {
        fileName: "i-$-open-api",
        refKey: "HTTP_REQUEST_INTERCEPTOR_INTERFACE_REF",
        className: "RequestInterceptor",
        folderPath: folder.getInterfaceFolder()
    }
}

export const HTTP_RESPONSE_INTERCEPTOR_INTERFACE_REF = (folder: FolderManager) => {
    return {
        fileName: "i-$-open-api",
        refKey: "HTTP_RESPONSE_INTERCEPTOR_INTERFACE_REF",
        className: "ResponseInterceptor",
        folderPath: folder.getInterfaceFolder()
    }
}

export const HTTP_ERROR_HANDLER_INTERFACE_REF = (folder: FolderManager) => {
    return {
        fileName: "i-$-open-api",
        refKey: "HTTP_ERROR_HANDLER_INTERFACE_REF",
        className: "ErrorHandler",
        folderPath: folder.getInterfaceFolder()
    }
}

export const OPEN_API_FUNCTION_REF = (folder: FolderManager) => {
    return {
        fileName: "open-api",
        refKey: "OPEN_API_FUNCTION_REF",
        className: "openApi",
        folderPath: folder.getFunctionFolder()
    }
}

export const QUERY_PARAMETER_FUNCTION_REF = (folder: FolderManager) => {
    return {
        fileName: "get-query-params",
        refKey: "QUERY_PARAMETER_FUNCTION_REF",
        className: "getQueryParameters",
        folderPath: folder.getFunctionFolder()
    }
}

export const SERVICE_REFERENCES = [
    HTTP_FUNCTION_REF,
    HTTP_REQUEST_INTERCEPTOR_INTERFACE_REF,
    HTTP_RESPONSE_INTERCEPTOR_INTERFACE_REF,
    HTTP_ERROR_HANDLER_INTERFACE_REF,
    OPEN_API_FUNCTION_REF,
    QUERY_PARAMETER_FUNCTION_REF
]

export class ObjectProperty implements IPropertyClass {

    className: string;
    fileName: string;
    description: Array<string> = [];
    imports: UniqueArray<string> = new UniqueArray<string>();
    functions: Array<{ data: IMustacheFunction, imports: Array<string>, name: string }> = [];
    properties: Array<{ data: IMustacheProperty, import?: string, name: string }> = [];

    constructor(originalName: string) {
        this.convertName(originalName);
    }

    private convertName(originalName: string) {
        this.className = formatText(originalName, 'ANY', 'PascalCase');
        this.fileName = formatText(originalName, 'ANY', 'KebabCase');
    }

    addImports(_import: string) {
        this.imports.push(_import);
    }

    addFunction(fun: IFunction) {
        const data: IMustacheFunction = {
            functionName: fun.functionName,

            originalPath: fun.originalPath,
            httpMethod: fun.httpMethod,

            isDescription: !!fun.description,
            description: splitByLineBreak(fun.description),

            isPathParameters: !!fun.pathParameters,
            pathParameters: fun.pathParameters?.params,
            pathParameterClassName: fun.pathParameters?.className,

            isQueryParameters: !!fun.queryParameters,
            queryParameters: fun.queryParameters?.params,
            queryParameterClassName: fun.queryParameters?.className,

            isHeaderParameters: !!fun.headerParameters,
            headerParameters: fun.headerParameters && Object.values(fun.headerParameters.params).map(param => {
                return {
                    name: param.name,
                    nameOriginal: param.nameOriginal,
                    required: param.required,
                }
            }),
            headerParameterClassName: fun.headerParameters?.className,

            isRequestBody: !!fun.requestBodyClass,
            isRequestBodyJson: !!fun.requestBodyClass && fun.isRequestBodyJson,
            requestBodyClass: fun.requestBodyClass,

            forceInterceptor: fun.forceInterceptor,
            isResponse: !!fun.responseClass,
            isJsonResponse: !!fun.responseClass && fun.isJsonResponse,
            isPlaintextResponse: fun.isPlaintextResponse,
            isDownloadResponse: fun.isDownloadResponse,
            responseClass: fun.responseClass
        }
        this.functions.push({data: data, imports: fun.imports, name: fun.functionName});
    }

    addProperty(prop: IProperty) {
        const data: IMustacheProperty = {
            isDescription: !!prop.description,
            description: splitByLineBreak(prop.description),
            required: prop.required,
            value: prop.value,
            propertyName: prop.propertyName,
            isArray: prop.isArray,
        }
        this.properties.push({data: data, import: prop.import, name: data.propertyName});
    }

    render(): IRenderResult {
        const renderedFunctions = this.functions.map(fun => {
            return {
                imports: fun.imports || [],
                name: fun.name,
                render: renderMustache('function-class.mustache', fun.data)
            }
        }).sort((a, b) => a.name.localeCompare(b.name));
        const renderProperties = this.properties.map((prop) => {
            return {import: prop.import, name: prop.name, render: renderMustache('property-class.mustache', prop.data)}
        }).sort((a, b) => a.name.localeCompare(b.name));

        const isFunction = renderedFunctions.length > 0;

        renderedFunctions.forEach(fun => this.imports.push(...fun.imports));
        renderProperties.forEach(property => this.imports.push(property.import));

        const viewData: IMustacheClass = {
            className: this.className,
            isInterface: Object.values(this.functions).length == 0,
            isImport: this.imports.get().length > 0,
            imports: this.imports.get().sort(),

            isDescription: (this.description || '').length > 0,
            description: this.description,

            isFunction: isFunction,
            function: renderedFunctions.map(rf => splitByLineBreak(rf.render)),

            isProperties: renderProperties.length > 0,
            properties: renderProperties.map(rf => splitByLineBreak(rf.render))
        }
        return {
            classEnumName: this.className,
            fileName: this.fileName,
            render: renderMustache('service-class.mustache', viewData)
        }
    }
}

interface IMustacheClass {
    className: string;

    isInterface: boolean;

    isImport: boolean;
    imports?: Array<string>;

    isDescription: boolean;
    description?: Array<string>;

    isFunction: boolean;
    function?: Array<Array<string>>;

    isProperties: boolean;
    properties: Array<Array<string>>;

}

interface IMustacheFunction {
    functionName: string;
    httpMethod: string;
    originalPath: string;

    isPathParameters: boolean;
    pathParameterClassName?: string;
    pathParameters?: Array<string>;

    isJsonResponse: boolean;
    isPlaintextResponse: boolean;
    isDownloadResponse: boolean;
    isRequestBodyJson: boolean;

    isDescription: boolean;
    description?: Array<string>;

    isQueryParameters: boolean;
    queryParameterClassName?: string;
    queryParameters?: Array<string>;

    isHeaderParameters: boolean;
    headerParameterClassName?: string;
    headerParameters?: Array<{ name: string, nameOriginal: string, required: boolean }>;

    isRequestBody: boolean;
    requestBodyClass?: string;

    forceInterceptor: boolean;
    isResponse: boolean;
    responseClass?: string;
}

export interface IFunction extends IFunctionResponse, IFunctionRequestBody {
    functionName: string;
    imports: Array<string>;

    httpMethod: string;
    originalPath: string;

    pathParameters?: {
        className: string;
        params: Array<string>
    };
    headerParameters?: {
        className: string;
        params: { [parameterName: string]: IHeaderParameter }
    };
    queryParameters?: {
        className: string;
        params: Array<string>
    };

    description: string;
    forceInterceptor: boolean;
}

export interface IFunctionResponse {
    isJsonResponse: boolean;
    isPlaintextResponse: boolean;
    isDownloadResponse: boolean;
    responseClass?: string;
}

export interface IFunctionRequestBody {
    isRequestBodyJson: boolean;
    requestBodyClass?: string;
}

interface IMustacheProperty {
    propertyName: string;

    isDescription: boolean;
    description?: Array<string>;

    required: boolean;
    isArray: boolean;
    value: string;
}

export interface IProperty {
    propertyName: string;
    import: string;
    description?: string;
    required: boolean;
    isArray: boolean;
    value: string;
}
