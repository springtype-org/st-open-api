import { formatText } from './text/formatText';

export const createPropertyName = (className: string, propertyName: string) =>
  formatText([className, propertyName], 'Any', 'PascalCase');
