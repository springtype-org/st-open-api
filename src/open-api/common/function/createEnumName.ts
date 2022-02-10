import { formatText } from './text/formatText';

export const createEnumName = (schemaName: string) => formatText([schemaName], 'Any', 'PascalCase');
