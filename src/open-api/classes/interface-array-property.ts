import { IPropertyClass, IRenderResult } from '../interface/i-property-class';
import { renderMustache } from '../function/render-mustache';
import { formatText } from '../common/function/text/formatText';
import { IRefResult } from './ref';
import { convertRefsToImports } from '../function/convertRefsToImports';

export class InterfaceArrayProperty implements IPropertyClass {
  interfaceName: string;

  fileName: string;

  description: Array<string> = [];

  imports: Array<IRefResult> = [];

  constructor(public originalName: string, importRef: IRefResult, public refClassName: string) {
    this.convertName(originalName);
    this.imports.push(importRef);
  }

  private convertName(originalName: string) {
    this.interfaceName = formatText(originalName, 'Any', 'PascalCase');
    this.fileName = formatText(originalName, 'Any', 'KebabCase');
  }

  render(): IRenderResult {
    const viewData: IMustacheInterfaceArray = {
      interfaceName: this.interfaceName,
      refClassName: this.refClassName,
      isImport: this.imports.length > 0,

      imports: convertRefsToImports(this.imports),
      isDescription: (this.description || '').length > 0,
      description: this.description,
    };
    return {
      classEnumName: this.interfaceName,
      fileName: this.fileName,
      render: renderMustache('interface-array.mustache', viewData),
    };
  }
}

interface IMustacheInterfaceArray {
  interfaceName: string;
  refClassName: string;
  isImport: boolean;
  imports: Array<string>;

  isDescription: boolean;
  description: Array<string>;
}
