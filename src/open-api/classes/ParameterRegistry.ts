import { IParameter } from '../interface/open-api-mine/i-parameter';

export class ParameterRegistry {
  refs: { [ref: string]: IParameter } = {};

  add = (refKey: string, parameter: IParameter) => {
    this.refs[refKey] = parameter;
  };

  get(refKey: string): IParameter | undefined {
    return this.refs[refKey];
  }
}
