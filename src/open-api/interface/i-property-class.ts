export interface IPropertyClass {
  render(): IRenderResult;
}

export interface IRenderResult {
  classEnumName: string;
  fileName: string;
  render: string;
}
