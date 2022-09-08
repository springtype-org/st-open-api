import { writeFileSync } from 'fs';
import { FolderManager } from './FolderManager';
import { Register } from './Register';
import { Logger } from './Logger';
import { createClassName } from '../common/function/createClassName';
import { createFileName } from '../common/function/createFileName';
import { createRefKey } from '../common/function/createRefKey';
import { createPropertyName } from '../common/function/createPropertyName';
import { createInterfaceName } from '../common/function/createInterfaceName';
import { createEnumName } from '../common/function/createEnumName';
import { createArrayName } from '../common/function/createArrayName';
import { mapPrimitiveValues } from '../common/function/mapPrimitiveValues';
import { groupServices } from '../common/function/groupServices';
import { createServiceName } from '../common/function/createServiceName';
import { createServiceFunctionName } from '../common/function/createServiceFunctionName';
import { ParameterRegistry } from './ParameterRegistry';
import { BaseConfiguration } from '../cli';
import { getFileExtension } from '../common/function/getFileExtension';

export class Configuration {
  private readonly folder: FolderManager;

  private readonly reference: Register;

  private readonly parameterRegister: ParameterRegistry;

  private createInterfaceName = createInterfaceName;

  private createPropertyName = createPropertyName;

  private groupServices = groupServices;

  private createEnumName = createEnumName;

  private createArrayName = createArrayName;

  private createClassName = createClassName;

  private createFileName = createFileName;

  private createServiceName = createServiceName;

  private defaultCreateServiceNameFn = createServiceFunctionName;

  private defaultGetFileExtensionFn = getFileExtension;

  private createRefKey = createRefKey;

  private mapPrimitiveValues = mapPrimitiveValues;

  constructor(private readonly config: BaseConfiguration, private readonly logger: Logger) {
    this.folder = new FolderManager(config.output);
    this.reference = new Register();
    this.parameterRegister = new ParameterRegistry();
  }

  getConfig(): BaseConfiguration {
    return this.config;
  }

  getSource() {
    return this.config.source;
  }

  getOutputFolder() {
    return this.folder.getOutputFolder();
  }

  isType() {
    return true;
  }

  isComponentOnly() {
    return !!this.config['only-components'];
  }

  ignoreValidation() {
    return !this.config.force;
  }

  getLanguage(): 'ts' | 'js' | 'onlyJs' {
    return this.config.language;
  }

  getFolderManager(): FolderManager {
    return this.folder;
  }

  getReference(): Register {
    return this.reference;
  }

  getParameterRegister(): ParameterRegistry {
    return this.parameterRegister;
  }

  getLogger(): Logger {
    return this.logger;
  }

  getCreateInterfaceNameFn() {
    return this.createInterfaceName;
  }

  getCreatePropertyNameFn() {
    return this.createPropertyName;
  }

  getCreateEnumNameFn() {
    return this.createEnumName;
  }

  getGroupServiceFn() {
    return this.groupServices;
  }

  getCreateArrayNameFn() {
    return this.createArrayName;
  }

  getCreateClassNameFn() {
    return this.createClassName;
  }

  getCreateFileNameFn() {
    return this.createFileName;
  }

  getCreateServiceNameFn() {
    return this.createServiceName;
  }

  getCreateServiceFunctionName(httpMethod: string, path: string, operationId: string | undefined) {
    return this.defaultCreateServiceNameFn(httpMethod, path, operationId);
  }

  getFileExtension() {
    return this.defaultGetFileExtensionFn();
  }

  getCreateRefKeyFn() {
    return this.createRefKey;
  }

  getWriteFileSyncFn() {
    return writeFileSync;
  }

  getMapPrimitiveValuesFn() {
    return this.mapPrimitiveValues;
  }
}
