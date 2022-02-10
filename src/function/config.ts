import {FolderManager} from "../classes/folder-manager";
import {Ref} from "../classes/ref";

export class Configuration {
    private config: any;
    private folder: FolderManager;
    private reference: Ref;
    private outputDirectory;

    setConfig(config: any) {
        this.config = config;
        this.folder = new FolderManager(this.config.output);
        this.outputDirectory = this.folder.getOutputFolder()
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

    getProviderName(): string {
        return this.config.provider;
    }

    getLanguage(): 'ts' | 'js' | 'onlyJs' {
        return this.config.language
    }

    getFolderManager(): FolderManager {
        return this.folder;
    }

    getReference(): Ref {
        return this.reference;
    }

    print() {
        console.log('--- Configuration')
        console.log()
        console.log(`OpenApi Source File: ${this.getOpenApiFile()}`)
        console.log(`Output folder: ${this.getOutputFolder()}`)
        console.log(`Debug: ${toString(this.isDebug())}`)
        console.log(`Create static services: ${toString(this.isCreateStaticServices())}`)
        console.log(`Create react provider: ${toString(this.isCreateReactProvider())}`)
        console.log(`Use types and not enumerations: ${toString(this.isType())}`)
        console.log(`Ignore open api validation: ${toString(this.ignoreValidation())}`)
        console.log(`Force to add request interceptor: ${toString(this.forceInterceptor())}`)
        console.log(`Current service suffix: ${this.getServiceSuffix()}`)
        console.log(`Client language: ${this.getLanguage()}`)
    }
}

const toString = (bool: boolean) => {
    return bool ? 'true' : 'false';
}
export const configuration = new Configuration();
