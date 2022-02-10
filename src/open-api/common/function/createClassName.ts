import { formatText } from './text/formatText';

export const createClassName = (schemaName: string, ...other: Array<string>) =>
  formatText([schemaName, ...other], 'Any', 'PascalCase');
