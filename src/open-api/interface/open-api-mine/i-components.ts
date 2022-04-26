import { ISchema } from './i-schema';
import { IReference } from './i-reference';
import { IParameter } from './i-parameter';

export interface IComponents {
  schemas: { [name: string]: ISchema | IReference };
  parameters?: { [name: string]: IParameter };
}
