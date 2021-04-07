import { ISchema } from './i-schema';
import { IReference } from './i-reference';

export interface IComponents {
  schemas: { [name: string]: ISchema | IReference };
}
