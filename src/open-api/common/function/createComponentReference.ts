import { Configuration, configuration } from '../../function/config';
import { getNormalizedName } from '../../component/schemas/property/getNoramlizedName';
import { ComponentType } from '../../component/schemas/ComponentType';

export type ComponentRef = {
  className: string;
  fileName: string;
  refKey: string;
};

export const createComponentReference = (
  schemaName: string,
  type: ComponentType,
  refkey: string,
  config: Configuration = configuration,
) => {
  const fileName = config.getCreateFileNameFn()(type, schemaName);
  const name = getNormalizedName(schemaName, type, config);

  const refKey = config.getCreateRefKeyFn()(refkey, schemaName);

  return {
    name,
    fileName,
    refKey,
  };
};
