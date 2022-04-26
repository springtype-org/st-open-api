import { Parameter } from './Parameter';
import { QueryParameter } from './QueryParameter';

export interface Request {
  method: string;
  url: string;
  urlParameter?: Parameter;
  queryParameter?: Array<QueryParameter>;
  header?: Parameter;
  body?: any;
}
