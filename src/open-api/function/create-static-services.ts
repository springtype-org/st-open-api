import { appendFileSync } from 'fs';
import { join } from 'path';
import { GROUP_NO_AUTH_SERVICE, GROUP_SERVICE, IRef } from '../classes/ref';
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
      propertyName: formatText(v.fileName, 'KebabCase', 'CamelCase'),
      serviceClassName: v.className,
    })),
    isImport: services.length > 0,
    imports: [
      ...services.map((v) => reference.getImportAndTypeByRef(v.refKey, folder.getConstantServicesFolder()).import),
      reference.getImportAndTypeByRef(OPEN_API_INTERFACE_REF(folder).refKey, folder.getConstantServicesFolder()).import,
    ].sort(),
  };

  appendFileSync(
    join(folder.getConstantServicesFolder(), `${folderSuffix}-services.ts`),
    renderMustache('service-constants.mustache', viewData),
  );
};
export const createStaticServices = () => {
  const reference = configuration.getReference();

  renderStaticServices(reference.getByGroup(GROUP_SERVICE), 'getAuthServices', 'auth');
  renderStaticServices(reference.getByGroup(GROUP_NO_AUTH_SERVICE), 'getNoAuthServices', 'no-auth');
};
