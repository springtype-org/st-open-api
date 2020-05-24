import {IParameter} from "./open-api-mine/i-parameter";

export interface ISortedParameter {
    params: { [key: string]: { [parameterName: string]: IParameter } };
    isParameter: boolean;
}