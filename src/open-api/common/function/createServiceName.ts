import { formatText } from './text/formatText';

export const createServiceName = (schemaName: string, ...other: Array<string>) =>
  formatText([schemaName, ...other, 'service'], 'Any', 'PascalCase');
