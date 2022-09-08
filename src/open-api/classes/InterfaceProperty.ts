import { IPropertyClass, IRenderResult } from '../interface/i-property-class';
import { renderMustache } from '../function/renderMustache';
import { splitByLineBreak } from '../function/splitByLineBreak';
import { IRefResult } from './register';
import { convertRefsToImports } from '../function/convertRefsToImports';
import { Configuration } from './Configuration';
import { createComponentReference } from '../common/function/createComponentReference';
import { ComponentType } from '../component/schemas/ComponentType';

export class InterfaceProperty implements IPropertyClass {
  interfaceName: string;

  fileName: string;

  type: ComponentType = 'INTERFACE';

  refKey: string;

  description: Array<string> = [];

  imports: Array<IRefResult> = [];

  properties: { [name: string]: { data: IMustacheProperty; import?: IRefResult } } = {};

  // later put here an type
  additionalProperties: Array<{ type: string; isArray: boolean }> = [];

  constructor(
    public originalName: string,
    public folderPath: string,
    public prefixRefKey: string,
    public schema: any,
    public config: Configuration,
  ) {
    const { refKey, fileName, name } = createComponentReference(originalName, this.type, prefixRefKey, config);

    this.refKey = refKey;
    this.interfaceName = name;
    this.fileName = fileName;
  }

  getReferenceKey(): string {
    return this.refKey;
  }

  addImports(newImport: IRefResult) {
    this.imports.push(newImport);
  }

  addAdditionalProperties(type: string, isArray = false) {
    this.additionalProperties.push({ type, isArray });
  }
  addProperty(prop: IProperty) {
    const data: IMustacheProperty = {
      isDescription: !!prop.description,
      description: splitByLineBreak((prop.description || '').trim()),
      required: prop.required,
      value: prop.value,
      propertyName: prop.propertyName,
      isArray: prop.isArray,
    };
    this.properties[data.propertyName] = { data, import: prop.import };
  }

  render(): IRenderResult {
    const renderProperties = Object.values(this.properties)
      .map((prop) => ({
        import: prop.import,
        name: prop.data.propertyName,
        render: renderMustache('property-class.mustache', prop.data),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    renderProperties.forEach((property) => this.imports.push(property.import));

    const viewData: IMustacheInterface = {
      interfaceName: this.interfaceName,
      isImport: this.imports.length > 0,
      imports: convertRefsToImports(this.imports),

      isDescription: this.description.length > 0,
      description: this.description,

      isProperties: renderProperties.length > 0,
      properties: renderProperties.map((rf) => splitByLineBreak(rf.render)),

      isAdditionalProperties: this.additionalProperties.length > 0,
      additionalProperties: this.additionalProperties,
    };

    return {
      classEnumName: this.interfaceName,
      fileName: this.fileName,
      render: renderMustache('interface.mustache', viewData),
    };
  }

  getName(): string {
    return this.interfaceName;
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

interface IMustacheInterface {
  interfaceName: string;

  isImport: boolean;
  imports?: Array<string>;

  isDescription: boolean;
  description?: Array<string>;

  isProperties: boolean;
  properties: Array<Array<string>>;

  isAdditionalProperties: boolean;
  additionalProperties: Array<{ type: string; isArray: boolean }>;
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
