import { Configuration } from '../../../function/config';
import { ComponentType } from '../ComponentType';

export const getNormalizedName = (schemaName: string, type: ComponentType, config: Configuration): string => {
  const typeMap: Record<ComponentType, (str: string) => string> = {
    ARRAY: config.getCreateArrayNameFn(),
    CLASS: config.getCreateClassNameFn(),
    ENUM: config.getCreateEnumNameFn(),
    INTERFACE: config.getCreateInterfaceNameFn(),
    PRIMITIVE: config.getCreateClassNameFn(),
  };
  return typeMap[type](schemaName);
};
