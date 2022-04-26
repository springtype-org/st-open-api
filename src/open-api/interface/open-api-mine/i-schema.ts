import { IType } from './i-type';

export interface ISchema {
  type?: IType | 'object' | 'array';
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: boolean;
  exclusiveMaximum?: boolean;
  maxLength?: number;
  minLength?: number;
  items?: ISchema;
  description?: string;
  required?: Array<string>;
  properties?: { [name: string]: ISchema };
  additionalProperties?: any;
  $ref?: string;
  enum?: Array<string | number>;
  allOf?: Array<{ $ref: string } | any>;
  format?: string;
  pattern?: string;
}
