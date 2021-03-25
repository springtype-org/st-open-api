import {IParameter} from "../interface/open-api-mine/i-parameter";
import {ISortedParameter} from "../interface/i-sorted-parameter";

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

        // no apply of 'authorization' header in each API endpoint;
        // this shall be done in an interceptor
        if (type === 'header' && typedParam.name === 'authorization') continue;
        
        result[type][typedParam.name] = typedParam;
    }

    return result
}
