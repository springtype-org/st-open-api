import {formatText} from "./formatText";

export const kebabCaseToCamel = (kebab: string) => {
    return formatText(kebab, 'KebabCase', "CamelCase")
}
