import { formatText } from './text/formatText';

export const createArrayName = (...parts: Array<string>) => formatText(parts, 'Any', 'PascalCase');
