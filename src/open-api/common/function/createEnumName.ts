import { formatText } from './text/formatText';

export const createEnumName = (...parts: Array<string>) => formatText(parts, 'Any', 'PascalCase');
