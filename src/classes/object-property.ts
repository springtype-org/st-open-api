import {IPropertyClass, IRenderResult} from "../interface/i-property-class";
import {camelToKebabCase} from "../function/camel-to-kebab-case";
import {renderMustache} from "../function/render-mustache";
import {UniqueArray} from "./unique-array";
import {splitByLineBreak} from "../function/split-by-line-break";
import {FolderManager} from "./folder-manager";
import {convertClassName} from "../function/convert-class-name";

export const HTTP_FUNCTION_REF = (folder: FolderManager) => {
    return {
        fileName: "http",
        refKey: "HTTP_FUNCTION_REF",
        className: "http",
        folderPath: folder.getFunctionFolder()
    }
}
export const HTTP_REQUEST_FUNCTION_REF = (folder: FolderManager) => {
    return {
        fileName: "http",
        refKey: "HTTP_REQUEST_FUNCTION_REF",
        className: "IRequest",
        folderPath: folder.getFunctionFolder()
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

export class ObjectProperty implements IPropertyClass {

    className: string;
    fileName: string;
    description: Array<string> = [];
    imports: UniqueArray<string> = new UniqueArray<string>();
    functions: { [name: string]: { data: IMustacheFunction, imports: Array<string> } } = {};
    properties: { [name: string]: { data: IMustacheProperty, import?: string } } = {}

    constructor(originalName: string) {
        this.convertName(originalName);
    }

    private convertName(originalName: string) {
        let className = convertClassName(originalName);
        this.className = className;
        this.fileName = camelToKebabCase(className);
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

            isUrlParameter: (fun.urlParameter || []).length > 0,
            urlParameter: fun.urlParameter || [],

            isParameter: !!fun.parameterClassName,
            parameterClassName: fun.parameterClassName,

            isQueryParameter: (fun.queryParameters || []).length > 0,
            queryParameters: fun.queryParameters || [],


            isRequestBody: !!fun.requestBodyClass,
            isRequestBodyJson: !!fun.requestBodyClass && fun.isRequestBodyJson,
            requestBodyClass: fun.requestBodyClass,

            forceInterceptor: fun.forceInterceptor,
            isResponse: !!fun.responseClass,
            isJsonResponse: !!fun.responseClass && fun.isJsonResponse,
            responseClass: fun.responseClass
        }
        this.functions[fun.functionName] = {data: data, imports: fun.imports};
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
        this.properties[data.propertyName] = {data: data, import: prop.import};
    }

    render(): IRenderResult {
        const renderedFunctions = Object.values(this.functions).map(fun => {
            return {imports: fun.imports || [], render: renderMustache('function-class.mustache', fun.data)}
        });
        const renderProperties = Object.values(this.properties).map((prop) => {
            return {import: prop.import, render: renderMustache('property-class.mustache', prop.data)}
        });

        const isFunction = renderedFunctions.length > 0;

        renderedFunctions.forEach(fun => this.imports.push(...fun.imports));
        renderProperties.forEach(property => this.imports.push(property.import));

        const viewData: IMustacheClass = {
            className: this.className,
            isInterface: Object.values(this.functions).length == 0,
            isImport: this.imports.get().length > 0,
            imports: this.imports.get(),

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

    isUrlParameter: boolean;
    urlParameter: Array<string>;

    isParameter: boolean;
    parameterClassName: string;

    isJsonResponse: boolean;
    isRequestBodyJson: boolean;

    isDescription: boolean;
    description?: Array<string>;

    isQueryParameter: boolean;
    queryParameters: Array<string>;

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
    urlParameter: Array<string>;

    description: string;

    parameterClassName?: string;

    queryParameters: Array<string>;
    forceInterceptor: boolean;
}

export interface IFunctionResponse {
    isJsonResponse: boolean;
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
