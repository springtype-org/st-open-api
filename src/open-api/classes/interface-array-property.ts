import { IPropertyClass, IRenderResult } from '../interface/i-property-class';
import { renderMustache } from '../function/render-mustache';
import { IRefResult } from './register';
import { convertRefsToImports } from '../function/convertRefsToImports';
import { Configuration, configuration } from '../function/config';
import { createComponentReference } from '../common/function/createComponentReference';
import { ComponentType } from '../component/schemas/ComponentType';

export class InterfaceArrayProperty implements IPropertyClass {
  interfaceName: string;

  fileName: string;

  type: ComponentType = 'ARRAY';

  refClassName: string;

  refKey: string;

  description: Array<string> = [];

  imports: Array<IRefResult> = [];

  constructor(
    public originalName: string,
    importRef: IRefResult,
    public folderPath: string,
    public prefixRefKey: string,
    public schema: any,
    public config: Configuration = configuration,
  ) {
    const { refKey, fileName, name } = createComponentReference(
      originalName,
      this.type,
      `${prefixRefKey}/item`,
      config,
    );
    this.refKey = refKey;

    this.refClassName = importRef.className;
    this.interfaceName = name;
    this.fileName = fileName;
    this.imports.push(importRef);
  }

  getReferenceKey(): string {
    return this.refKey;
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

interface IMustacheInterfaceArray {
  interfaceName: string;
  refClassName: string;
  isImport: boolean;
  imports: Array<string>;

  isDescription: boolean;
  description: Array<string>;
}
