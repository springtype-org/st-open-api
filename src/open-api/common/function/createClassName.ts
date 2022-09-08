import { formatText } from './text/formatText';

export const createClassName = (...parts: Array<string>) => formatText(parts, 'Any', 'PascalCase');
