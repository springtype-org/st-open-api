import { formatText } from '../common/function/text/formatText';

export const kebabCaseToSnake = (kebab: string) => formatText(kebab, 'KebabCase', 'SnakeCase');
