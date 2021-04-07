/* eslint-disable no-console */
import { FolderManager } from '../classes/folder-manager';
import { Ref } from '../classes/ref';

export class Configuration {
  private config: any;

  private folder: FolderManager;

  private reference: Ref;

  private outputDirectory;

  setConfig(config: any) {
    this.config = config;
    this.folder = new FolderManager(this.config.output);
    this.outputDirectory = this.folder.getOutputFolder();
    this.reference = new Ref();
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

  getReference(): Ref {
    return this.reference;
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
