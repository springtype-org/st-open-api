export interface IOpenApiOpt {
    serviceSuffix: string;
    verbose: boolean;
    force: boolean;
    language: 'ts'|'js'|'onlyJs';
    react: boolean;
}
