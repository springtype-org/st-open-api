import {formatText} from "./formatText";

export const kebabCaseToSnake = (kebab: string) => {
    return formatText(kebab, 'KebabCase', 'SnakeCase')
}
