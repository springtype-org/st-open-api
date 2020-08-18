import {Path} from "typescript";

export interface IOpenApiOpt {
    serviceSuffix: string;
    verbose: boolean;
    force: boolean;
    forceInterceptor: boolean;
    createStaticServices: boolean;
    language: 'ts'|'js'|'onlyJs';
    react: boolean;
    config: Path
}
