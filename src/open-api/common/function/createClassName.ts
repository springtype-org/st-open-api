import { formatText } from './text/formatText';

export const createClassName = (schemaName: string) => formatText(schemaName, 'Any', 'PascalCase');
