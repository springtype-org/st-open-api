/* eslint-disable no-console */
import { writeFileSync } from 'fs';
import { FolderManager } from '../classes/folder-manager';
import { Register } from '../classes/register';
import { ConsoleLogger, Logger } from '../classes/Logger';
import { createClassName } from '../common/function/createClassName';
import { createFileName } from '../common/function/createFileName';
import { createRefKey } from '../common/function/createRefKey';
import { createPropertyName } from '../common/function/createPropertyName';
import { createInterfaceName } from '../common/function/createInterfaceName';
import { createEnumName } from '../common/function/createEnumName';
import { createArrayName } from '../common/function/createArrayName';
import { mapPrimitiveValues } from '../common/function/mapPrimitiveValues';

export class Configuration {
  private config: any;

  private folder: FolderManager = new FolderManager('/tmp');

  private reference: Register = new Register();

  private outputDirectory = this.folder.getOutputFolder();

  private logger: Logger = new ConsoleLogger('WARN');

  private createInterfaceName = createInterfaceName;

  private createPropertyName = createPropertyName;

  private createEnumName = createEnumName;

  private createArrayName = createArrayName;

  private createClassName = createClassName;

  private createFileName = createFileName;

  private createRefKey = createRefKey;

  private mapPrimitiveValues = mapPrimitiveValues;

  setConfig(config: any) {
    this.config = config;
    this.folder = new FolderManager(this.config.output);
    this.outputDirectory = this.folder.getOutputFolder();
    this.logger = new ConsoleLogger(this.config?.debug ? 'DEBUG' : 'WARN');
  }

  getConfig() {
    return this.config;
  }

  getOpenApiFile() {
    return this.config.source;
  }

  getOutputFolder() {
    return this.outputDirectory;
  }

  isDebug() {
    return !!this.config.debug;
  }

  isCreateStaticServices() {
    return !!this.config.static;
  }

  isCreateReactProvider() {
    return !!this.config.react;
  }

  isType() {
    return !!this.config.type;
  }

  isComponentOnly() {
    return !!this.config.component;
  }

  ignoreValidation() {
    return !this.config.force;
  }

  forceInterceptor() {
    return !!this.config.interceptor;
  }

  getServiceSuffix(): string {
    return this.config.suffix;
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

  getCreateArrayNameFn() {
    return this.createArrayName;
  }

  getCreateClassNameFn() {
    return this.createClassName;
  }

  getCreateFileNameFn() {
    return this.createFileName;
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

  print() {
    console.log('--- Configuration');
    console.log();
    console.log(`OpenApi Source File: ${this.getOpenApiFile()}`);
    console.log(`Output folder: ${this.getOutputFolder()}`);
    console.log(`Debug: ${this.isDebug()}`);
    console.log(`Create static services: ${this.isCreateStaticServices().toString()}`);
    console.log(`Create react provider: ${this.isCreateReactProvider().toString()}`);
    console.log(`Use types and not enumerations: ${this.isType().toString()}`);
    console.log(`Ignore open api validation: ${this.ignoreValidation().toString()}`);
    console.log(`Force to add request interceptor: ${this.forceInterceptor().toString()}`);
    console.log(`Current service suffix: ${this.getServiceSuffix()}`);
    console.log(`Client language: ${this.getLanguage()}`);
  }
}

export const configuration = new Configuration();
