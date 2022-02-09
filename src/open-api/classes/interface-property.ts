import { IPropertyClass, IRenderResult } from '../interface/i-property-class';
import { renderMustache } from '../function/render-mustache';
import { splitByLineBreak } from '../function/split-by-line-break';
import { formatText } from '../common/function/text/formatText';
import { IRefResult } from './ref';
import { convertRefsToImports } from '../function/convertRefsToImports';

export class InterfaceProperty implements IPropertyClass {
  interfaceName: string;

  fileName: string;

  description: Array<string> = [];

  imports: Array<IRefResult> = [];

  properties: { [name: string]: { data: IMustacheProperty; import?: IRefResult } } = {};

  // later put here an type
  additionalProperties: Array<{ type: string; isArray: boolean }> = [];

  constructor(public originalName: string) {
    this.convertName(originalName);
  }

  private convertName(originalName: string) {
    this.interfaceName = formatText(originalName, 'Any', 'PascalCase');
    this.fileName = formatText(originalName, 'Any', 'KebabCase');
  }

  addImports(newImport: IRefResult) {
    this.imports.push(newImport);
  }

  addAdditionalProperties(type: string, isArray: boolean = false) {
    this.additionalProperties.push({ type, isArray });
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

      isDescription: (this.description || '').length > 0,
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
