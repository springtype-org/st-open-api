import { formatText } from './text/formatText';

export const createFileName = (schemaName: string) => formatText(schemaName, 'Any', 'KebabCase');
