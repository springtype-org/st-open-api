import { IPropertyClass, IRenderResult } from '../interface/i-property-class';
import { renderMustache } from '../function/renderMustache';
import { splitByLineBreak } from '../function/splitByLineBreak';
import { IRefResult } from './register';
import { convertRefsToImports } from '../function/convertRefsToImports';
import { createComponentReference } from '../common/function/createComponentReference';
import { Configuration } from './Configuration';
import { ComponentType } from '../component/schemas/ComponentType';

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
    private config: Configuration,
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
    const headerParameters: Array<{ name: string; value: string }> = [];
    if (!!fun.isRequestBodyJson) {
      headerParameters.push({ name: 'accept', value: 'application/json' });
    } else if (!!fun.responseClass && fun.isPlaintextResponse) {
      headerParameters.push({ name: 'accept', value: 'text/plain' });
    } else if (!!fun.responseClass && fun.isDownloadResponse) {
      headerParameters.push({ name: 'accept', value: 'application/octet-stream' });
    }
    if (!!fun.responseClass && fun.isJsonResponse) {
      headerParameters.push({ name: 'content-type', value: 'application/json' });
    } else if (!!fun.requestBodyClass && fun.isRequestBodyUpload) {
      headerParameters.push({ name: 'content-type', value: 'multipart/form-data' });
    }

    const data: IMustacheFunction = {
      functionName: fun.functionName,

      originalPath: fun.originalPath,
      httpMethod: fun.httpMethod,

      isDescription: !!fun.description,
      description: splitByLineBreak(fun.description),

      isPathParameters: !!fun.pathParameters,
      pathParameterClassName: fun.pathParameters?.className,

      isQueryParameters: !!fun.queryParameters,
      queryParameterClassName: fun.queryParameters?.className,

      isHeaderParameters: !!fun.headerParameters,
      headerParameterClassName: fun.headerParameters?.className,
      isRequestBody: !!fun.requestBodyClass,

      headerParameters,
      requestBodyClass: fun.requestBodyClass,

      isResponse: !!fun.responseClass,

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

  isDescription: boolean;
  description?: Array<string>;

  isQueryParameters: boolean;
  queryParameterClassName?: string;

  isHeaderParameters: boolean;
  headerParameterClassName?: string;
  headerParameters?: Array<{ name: string; value: string }>;

  isRequestBody: boolean;
  requestBodyClass?: string;

  isResponse: boolean;
  responseClass?: string;
}
export interface ImportParameterMapping {
  className: string;
  params: Array<{ name: string; value: string }>;
}
export interface IFunction extends IFunctionResponse, IFunctionRequestBody {
  functionName: string;
  imports: Array<IRefResult>;

  httpMethod: string;
  originalPath: string;

  pathParameters?: ImportParameterMapping;
  headerParameters?: ImportParameterMapping;
  queryParameters?: ImportParameterMapping;
  cookieParameters?: ImportParameterMapping;

  description: string;
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
