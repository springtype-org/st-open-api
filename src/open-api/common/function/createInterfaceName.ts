import { formatText } from './text/formatText';

export const createInterfaceName = (schemaName: string, ...other: Array<string>) =>
  formatText([schemaName, ...other], 'Any', 'PascalCase');
