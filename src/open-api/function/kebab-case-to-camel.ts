import { formatText } from './formatText';

export const kebabCaseToCamel = (kebab: string) => formatText(kebab, 'KebabCase', 'CamelCase');
