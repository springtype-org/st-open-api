import { appendFileSync } from 'fs';
import { join } from 'path';
import { GROUP_NO_AUTH_SERVICE, GROUP_SERVICE, IRef } from '../classes/register';
import { renderMustache } from './render-mustache';
import { configuration } from './config';
import { formatText } from '../common/function/text/formatText';
import { OPEN_API_INTERFACE_REF } from '../classes/object-property';

export interface IReactProviderMustache {
  ServiceConstantName: string;
  services: Array<{
    propertyName: string;
    serviceClassName: string;
  }>;
  isImport: boolean;
  imports: Array<string>;
}
const renderStaticServices = (
  services: Array<IRef & { refKey: string }>,
  variableName: string,
  folderSuffix: string,
) => {
  const folder = configuration.getFolderManager();
  const reference = configuration.getReference();
  const viewData: IReactProviderMustache = {
    ServiceConstantName: variableName,
    services: services.map((v) => ({
      propertyName: formatText([v.fileName], 'Any', 'CamelCase'),
      serviceClassName: v.className,
    })),
    isImport: services.length > 0,
    imports: [
      ...services.map((v) => reference.getImportAndTypeByRef(v.refKey, folder.getConstantServicesFolder()).import),
      reference.getImportAndTypeByRef(OPEN_API_INTERFACE_REF(folder).refKey, folder.getConstantServicesFolder()).import,
    ].sort(),
  };

  // TODO: do this language specific
  appendFileSync(
    join(folder.getConstantServicesFolder(), formatText([folderSuffix, 'services'], 'Any', 'PascalCase') + '.ts'),
    renderMustache('service-constants.mustache', viewData),
  );
};
export const createStaticServices = () => {
  const reference = configuration.getReference();
  for (const groupName of reference.getAllGroups()) {
    renderStaticServices(
      reference.getByGroup(groupName),
      formatText(['get', groupName, 'Services'], 'Any', 'CamelCase'),
      groupName,
    );
  }
};
