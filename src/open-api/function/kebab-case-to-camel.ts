import { formatText } from '../common/function/text/formatText';

export const kebabCaseToCamel = (kebab: string) => formatText([kebab], 'KebabCase', 'CamelCase');
