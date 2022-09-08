import { ComponentType } from '../component/schemas/ComponentType';

export interface IPropertyClass {
  render(): IRenderResult;
  // addDescription(...lines: Array<string>);
  getOriginalName(): string;
  getFolderPath(): string;
  getFileName(): string;
  getSchema(): any;
  getName(): string;
  getType(): ComponentType;
  getReferenceKey(): string;
}

export interface IRenderResult {
  classEnumName: string;
  fileName: string;
  render: string;
}
