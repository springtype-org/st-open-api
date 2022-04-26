import { formatText } from './text/formatText';
import { ComponentType } from '../../component/schemas/ComponentType';

export const createFileName = (type: ComponentType, schemaName: string, ...other: Array<string>) => {
  const fileNameMap: Record<ComponentType, () => string> = {
    ARRAY: () => formatText([schemaName, ...other], 'Any', 'PascalCase'),
    ENUM: () => formatText([schemaName, ...other], 'Any', 'PascalCase'),
    INTERFACE: () => formatText([schemaName, ...other], 'Any', 'PascalCase'),
    CLASS: () => formatText([schemaName, ...other], 'Any', 'PascalCase'),
    PRIMITIVE: () => formatText([schemaName, ...other], 'Any', 'PascalCase'),
  };
  return fileNameMap[type]();
};
