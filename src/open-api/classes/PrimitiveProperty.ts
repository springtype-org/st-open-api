import { IPropertyClass, IRenderResult } from '../interface/i-property-class';
import { renderMustache } from '../function/renderMustache';
import { Configuration } from './Configuration';
import { createComponentReference } from '../common/function/createComponentReference';
import { ComponentType } from '../component/schemas/ComponentType';
import { splitByLineBreak } from '../function/splitByLineBreak';

export class PrimitiveProperty implements IPropertyClass {
  primitiveName: string;

  refKey: string;

  type: ComponentType = 'PRIMITIVE';

  fileName: string;

  value: string;

  description: Array<string> = [];

  constructor(
    private originalName: string,
    private folderPath: string,
    prefixRefKey: string,
    private schema: any,
    private config: Configuration,
  ) {
    const { refKey, fileName, name } = createComponentReference(originalName, this.type, prefixRefKey, config);

    this.refKey = refKey;
    this.primitiveName = name;
    this.fileName = fileName;
  }

  setValue(value: string) {
    this.value = value;
  }
  addDescription(description: string) {
    this.description.push(...splitByLineBreak((description || '').trim()));
  }

  getReferenceKey(): string {
    return this.refKey;
  }

  render(): IRenderResult {
    const viewData: IMustachePrimitive = {
      primitiveName: this.primitiveName,
      description: this.description,
      isDescription: this.description.length > 0,
      value: this.value,
    };
    return {
      classEnumName: this.primitiveName,
      fileName: this.fileName,
      render: renderMustache(`primitive.mustache`, viewData),
    };
  }

  getName(): string {
    return this.primitiveName;
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

interface IMustachePrimitive {
  primitiveName: string;
  isDescription: boolean;
  description: Array<string>;
  value: string;
}
