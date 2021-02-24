const EMPTY_STRING = '';

/**
 * Build the query
 * @param parameters
 */
export const getQueryParameters = (parameters: Array<IQueryParam> = []): string => {
    const keyValue: Array<string> = [];
    for (const parameter of parameters) {
        if (!!parameter.value) {
            if (Array.isArray(parameter.value)) {
                parameter.value.forEach(v => keyValue.push(getQueryParameter(parameter.name, v)));
            } else {
                keyValue.push(getQueryParameter(parameter.name, parameter.value));
            }
        }
    }
    if(keyValue.length === 0){
        return EMPTY_STRING;
    }
    return `?${keyValue.join('&')}`
};

const getQueryParameter = (paramName: string, paramValue: string) => {
    return `${encodeURIComponent(paramName)}=${encodeURIComponent(paramValue)}`;
};

export interface IQueryParam {
    name: string,
    value: any
}
