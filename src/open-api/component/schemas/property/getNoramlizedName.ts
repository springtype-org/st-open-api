import { Configuration } from '../../../classes/Configuration';
import { ComponentType } from '../ComponentType';

export const getNormalizedName = (
  type: ComponentType,
  config: Configuration,
  name,
  otherParts: Array<string> = [],
): string => {
  const typeMap: Record<ComponentType, (...parts: Array<string>) => string> = {
    ARRAY: config.getCreateArrayNameFn(),
    CLASS: config.getCreateClassNameFn(),
    ENUM: config.getCreateEnumNameFn(),
    INTERFACE: config.getCreateInterfaceNameFn(),
    PRIMITIVE: config.getCreateClassNameFn(),
  };
  return typeMap[type](name, ...otherParts);
};
