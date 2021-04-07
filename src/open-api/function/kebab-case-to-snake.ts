import { formatText } from './formatText';

export const kebabCaseToSnake = (kebab: string) => formatText(kebab, 'KebabCase', 'SnakeCase');
