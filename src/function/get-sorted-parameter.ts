import {IParameter} from "../interface/open-api-mine/i-parameter";
import {ISortedParameter} from "../interface/i-sorted-parameter";
import { formatText } from "./formatText";
import { IHeaderParameter } from "../interface/i-header-parameter";

export const getSortedParameter = (path: string, parameters: Array<IParameter> = []): ISortedParameter => {

    const result: ISortedParameter = {
        cookie: {},
        header: {},
        query:{},
        path:{},
    };

    for (const parameter of parameters) {
        const typedParam = parameter as IParameter;
        const type = typedParam.in;

        if (type === 'header') {
            // no apply of 'authorization' header in each API endpoint;
            // this shall be done in an interceptor
            if (typedParam.name === 'authorization') {
                continue;
            }
            const typedParamFormatted: IHeaderParameter = {
                ...typedParam, 
                name: formatText(typedParam.name, 'ANY', 'CamelCase'),      // HTTP headers often use Upper-Kebab-Case
                nameOriginal: typedParam.name
            };
            result[type][typedParam.name] = typedParamFormatted;
        }

        else {
            result[type][typedParam.name] = typedParam;
        }
    }

    return result
}
