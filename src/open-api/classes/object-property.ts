import { IPropertyClass, IRenderResult } from '../interface/i-property-class';
import { renderMustache } from '../function/render-mustache';
import { splitByLineBreak } from '../function/split-by-line-break';
import { FolderManager } from './folder-manager';
import { IRefResult } from './register';
import { convertRefsToImports } from '../function/convertRefsToImports';
import { createComponentReference } from '../common/function/createComponentReference';
import { Configuration, configuration } from '../function/config';
import { ComponentType } from '../component/ComponentType';

export const HTTP_FUNCTION_REF = (folder: FolderManager) => ({
  fileName: 'http',
  refKey: 'HTTP_FUNCTION_REF',
  className: 'http',
  folderPath: folder.getFunctionFolder(),
});

export const HTTP_CONVERT_TO_FORM_DATA_REF = (folder: FolderManager) => ({
  fileName: 'http',
  refKey: 'HTTP_CONVERT_TO_FORM_DATA_REF',
  className: 'convertRequestToFormData',
  folderPath: folder.getFunctionFolder(),
});

export const HTTP_ON_JSON_LOAD_FUNCTION_REF = (folder: FolderManager) => ({
  fileName: 'http',
  refKey: 'HTTP_ON_JSON_LOAD_FUNCTION_REF',
  className: 'onJsonLoad',
  folderPath: folder.getFunctionFolder(),
});

export const HTTP_ON_PLAIN_TEXT_LOAD_FUNCTION_REF = (folder: FolderManager) => ({
  fileName: 'http',
  refKey: 'HTTP_ON_PLAIN_TEXT_LOAD_FUNCTION_REF',
  className: 'onPlainTextLoad',
  folderPath: folder.getFunctionFolder(),
});
export const HTTP_ON_BINARY_LOAD_FUNCTION_REF = (folder: FolderManager) => ({
  fileName: 'http',
  refKey: 'HTTP_ON_BINARY_LOAD_FUNCTION_REF',
  className: 'onBinaryLoad',
  folderPath: folder.getFunctionFolder(),
});

export const HTTP_ON_BINARY_BEFORE_SEND_FUNCTION_REF = (folder: FolderManager) => ({
  fileName: 'http',
  refKey: 'HTTP_ON_BINARY_BEFORE_SEND_FUNCTION_REF',
  className: 'onBinaryBeforeSend',
  folderPath: folder.getFunctionFolder(),
});

export const HTTP_OPTION_INTERFACE_REF = (folder: FolderManager) => ({
  fileName: 'open-api',
  refKey: 'HTTP_OPTION_INTERFACE_REF',
  className: 'HttpOption',
  folderPath: folder.getInterfaceFolder(),
});

export const OPEN_API_INTERFACE_REF = (folder: FolderManager) => ({
  fileName: 'open-api',
  refKey: 'OPEN_API_INTERFACE_REF',
  className: 'OpenApi',
  folderPath: folder.getInterfaceFolder(),
});

export const OPEN_API_FUNCTION_REF = (folder: FolderManager) => ({
  fileName: 'open-api',
  refKey: 'OPEN_API_FUNCTION_REF',
  className: 'openApi',
  folderPath: folder.getFunctionFolder(),
});

export const SERVICE_REFERENCES = [
  HTTP_FUNCTION_REF,
  HTTP_CONVERT_TO_FORM_DATA_REF,
  HTTP_ON_JSON_LOAD_FUNCTION_REF,
  HTTP_ON_PLAIN_TEXT_LOAD_FUNCTION_REF,
  HTTP_ON_BINARY_BEFORE_SEND_FUNCTION_REF,
  HTTP_ON_BINARY_LOAD_FUNCTION_REF,
  HTTP_OPTION_INTERFACE_REF,
  OPEN_API_INTERFACE_REF,
];

export class ObjectProperty implements IPropertyClass {
  className: string;

  fileName: string;

  type: ComponentType = 'CLASS';

  refKey: string;

  description: Array<string> = [];

  imports: Array<IRefResult> = [];

  functions: Array<{ data: IMustacheFunction; imports: Array<IRefResult>; name: string }> = [];

  properties: Array<{ data: IMustacheProperty; import?: IRefResult; name: string }> = [];

  constructor(
    public originalName: string,
    private folderPath: string,
    private prefixRefKey: string,
    private schema: any,
    private config: Configuration = configuration,
  ) {
    const { refKey, fileName, name } = createComponentReference(originalName, this.type, prefixRefKey, config);

    this.refKey = refKey;
    this.className = name;
    this.fileName = fileName;
  }

  getReferenceKey(): string {
    return this.refKey;
  }

  addImports(newImport: IRefResult) {
    this.imports.push(newImport);
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
      headerParameters: fun.headerParameters?.params,
      headerParameterClassName: fun.headerParameters?.className,

      isRequestBody: !!fun.requestBodyClass,
      isRequestBodyJson: !!fun.requestBodyClass && fun.isRequestBodyJson,
      isRequestBodyUpload: !!fun.requestBodyClass && fun.isRequestBodyUpload,
      requestBodyClass: fun.requestBodyClass,

      forceInterceptor: fun.forceInterceptor,
      isResponse: !!fun.responseClass,
      isJsonResponse: !!fun.responseClass && fun.isJsonResponse,
      isPlaintextResponse: !!fun.responseClass && fun.isPlaintextResponse,
      isDownloadResponse: fun.isDownloadResponse,

      responseClass: fun.responseClass,
    };
    this.functions.push({ data, imports: fun.imports, name: fun.functionName });
  }

  addProperty(prop: IProperty) {
    const data: IMustacheProperty = {
      isDescription: !!prop.description,
      description: splitByLineBreak(prop.description),
      required: prop.required,
      value: prop.value,
      propertyName: prop.propertyName,
      isArray: prop.isArray,
    };
    this.properties.push({ data, import: prop.import, name: data.propertyName });
  }

  render(): IRenderResult {
    const renderedFunctions = this.functions
      .map((fun) => ({
        imports: fun.imports || [],
        name: fun.name,
        render: renderMustache('function-class.mustache', fun.data),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
    const renderProperties = this.properties
      .map((prop) => ({
        import: prop.import,
        name: prop.name,
        render: renderMustache('property-class.mustache', prop.data),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const isFunction = renderedFunctions.length > 0;

    renderedFunctions.forEach((fun) => this.imports.push(...fun.imports));
    renderProperties.forEach((property) => this.imports.push(property.import));

    const viewData: IMustacheClass = {
      className: this.className,
      isInterface: Object.values(this.functions).length === 0,
      isImport: this.imports.length > 0,
      imports: convertRefsToImports(this.imports),

      isDescription: (this.description || '').length > 0,
      description: this.description,

      isFunction,
      function: renderedFunctions.map((rf) => splitByLineBreak(rf.render)),

      isProperties: renderProperties.length > 0,
      properties: renderProperties.map((rf) => splitByLineBreak(rf.render)),
    };
    return {
      classEnumName: this.className,
      fileName: this.fileName,
      render: renderMustache('service-class.mustache', viewData),
    };
  }

  getName(): string {
    return this.className;
  }

  getOriginalName(): string {
    return this.originalName;
  }

  getType(): ComponentType {
    return this.type;
  }

  getFolderPath(): string {
    return this.folderPath;
  }

  getFileName(): string {
    return this.fileName;
  }

  getSchema(): any {
    return this.schema;
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
  pathParameters?: Array<{ name: string; value: string }>;

  isJsonResponse: boolean;
  isPlaintextResponse: boolean;
  isDownloadResponse: boolean;
  isRequestBodyJson: boolean;
  isRequestBodyUpload: boolean;

  isDescription: boolean;
  description?: Array<string>;

  isQueryParameters: boolean;
  queryParameterClassName?: string;
  queryParameters?: Array<{ name: string; value: string }>;

  isHeaderParameters: boolean;
  headerParameterClassName?: string;
  headerParameters?: Array<{ name: string; value: string }>;

  isRequestBody: boolean;
  requestBodyClass?: string;

  forceInterceptor: boolean;
  isResponse: boolean;
  responseClass?: string;
}

export interface IFunction extends IFunctionResponse, IFunctionRequestBody {
  functionName: string;
  imports: Array<IRefResult>;

  httpMethod: string;
  originalPath: string;

  pathParameters?: {
    className: string;
    params: Array<{ name: string; value: string }>;
  };
  headerParameters?: {
    className: string;
    params: Array<{ name: string; value: string }>;
  };
  queryParameters?: {
    className: string;
    params: Array<{ name: string; value: string }>;
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
  isRequestBodyUpload: boolean;
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
  import?: IRefResult;
  description?: string;
  required: boolean;
  isArray: boolean;
  value: string;
}
