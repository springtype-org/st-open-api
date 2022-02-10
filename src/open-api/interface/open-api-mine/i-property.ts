import { IFormat } from './i-format';
import { IType } from './i-type';
import { ISchema } from './i-schema';

export interface IProperty {
  type: IType;
  format: IFormat;
  items?: ISchema;
}
