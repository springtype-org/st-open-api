import { formatText } from './text/formatText';

export const createArrayName = (schemaName: string) => formatText([schemaName], 'Any', 'PascalCase');
