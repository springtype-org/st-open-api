import { IPropertyClass, IRenderResult } from '../interface/i-property-class';
import { renderMustache } from '../function/renderMustache';
import { IRefResult } from './register';
import { convertRefsToImports } from '../function/convertRefsToImports';
import { Configuration } from './Configuration';
import { createComponentReference } from '../common/function/createComponentReference';
import { ComponentType } from '../component/schemas/ComponentType';

export class InterfaceOneOfProperty implements IPropertyClass {
  interfaceName: string;

  fileName: string;

  type: ComponentType = 'INTERFACE';

  refKey: string;

  description: Array<string> = [];

  imports: Array<IRefResult> = [];

  oneOfs: Array<string> = [];

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

  addOneOf(oneOf: string) {
    this.oneOfs.push(oneOf);
  }

  render(): IRenderResult {
    const viewData: IMustacheInterface = {
      interfaceName: this.interfaceName,
      isImport: this.imports.length > 0,
      imports: convertRefsToImports(this.imports),

      isDescription: this.description.length > 0,
      description: this.description,

      oneOfs: this.oneOfs,
    };

    return {
      classEnumName: this.interfaceName,
      fileName: this.fileName,
      render: renderMustache('interface-one-of.mustache', viewData),
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

  oneOfs: Array<string>;
}
