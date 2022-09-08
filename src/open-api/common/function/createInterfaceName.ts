import { formatText } from './text/formatText';

export const createInterfaceName = (...parts: Array<string>) => {
  return formatText(parts, 'Any', 'PascalCase');
};
