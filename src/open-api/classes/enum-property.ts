import { IPropertyClass, IRenderResult } from '../interface/i-property-class';
import { renderMustache } from '../function/render-mustache';
import { Configuration, configuration } from '../function/config';
import { createComponentReference } from '../common/function/createComponentReference';
import { ComponentType } from '../component/ComponentType';

export class EnumProperty implements IPropertyClass {
  enumName: string;

  refKey: string;

  type: ComponentType = 'ENUM';

  fileName: string;

  values: Array<{ isString: boolean; value: string }> = [];

  constructor(
    private originalName: string,
    private folderPath: string,
    prefixRefKey: string,
    private schema: any,
    private config: Configuration = configuration,
  ) {
    const { refKey, fileName, name } = createComponentReference(originalName, this.type, prefixRefKey, config);

    this.refKey = refKey;
    this.enumName = name;
    this.fileName = fileName;
  }

  setValues(values: Array<number | string>) {
    this.values = values.map((value) => ({
      isString: typeof value === 'string',
      value: value.toString(),
    }));
  }

  getReferenceKey(): string {
    return this.refKey;
  }

  render(): IRenderResult {
    const viewData: IMustacheEnum = {
      enumName: this.enumName,
      // DO NOT SORT ARRAYS
      values: this.values.map((value, index, arr) => ({
        ...value,
        last: index === arr.length - 1,
      })),
    };
    return {
      classEnumName: this.enumName,
      fileName: this.fileName,
      render: renderMustache(`${configuration.isType() ? 'type' : 'enum'}.mustache`, viewData),
    };
  }

  getName(): string {
    return this.enumName;
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

interface IMustacheEnum {
  enumName: string;
  values: Array<{ isString: boolean; value: string; last: boolean }>;
}
