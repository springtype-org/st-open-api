import { ComponentType } from '../component/ComponentType';

export interface IPropertyClass {
  render(): IRenderResult;
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
