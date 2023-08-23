import { IHeaderParameter } from "./i-header-parameter";
import {IParameter} from "./open-api-mine/i-parameter";

export interface ISortedParameter {
    'query': { [parameterName: string]: IParameter }
    'path': { [parameterName: string]: IParameter }
    'cookie': { [parameterName: string]: IParameter }
    'header': { [parameterName: string]: IHeaderParameter }
}
