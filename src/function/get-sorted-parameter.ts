import {IParameter} from "../interface/open-api-mine/i-parameter";
import {ISortedParameter} from "../interface/i-sorted-parameter";

export const getSortedParameter = (path: string, parameters: Array<IParameter> = []): ISortedParameter => {

    const isParameter = parameters.length > 0;
    const sortedParameter: ISortedParameter = {
        params: {},
        isParameter,
    };

    if (isParameter) {
        for (const parameter of parameters) {
            const typedParam = parameter as IParameter;
            const type = typedParam.in;
            if (!sortedParameter.params[type]) {
                sortedParameter.params[type] = {}
            }
            sortedParameter.params[type][typedParam.name] = typedParam;
        }
    }
    return sortedParameter;
}