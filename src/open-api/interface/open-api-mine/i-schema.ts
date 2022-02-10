import { IType } from './i-type';

export interface ISchema {
  type?: IType | 'object' | 'array';
  maxLength?: number;
  minLength?: number;
  items?: ISchema;
  required?: Array<string>;
  properties?: { [name: string]: ISchema };
  additionalProperties?: any;
  $ref?: string;
  enum?: Array<string | number>;
  allOf?: Array<{ $ref: string } | any>;
  format?: string;
}
