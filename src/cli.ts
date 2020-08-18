#!/usr/bin/env node

import {getPackageInfo} from "./function/get-package-info";
import {executeGenerationAction} from "./function/execute-generation-action";

import {Command} from 'commander';


(async () => {
    // if nothing added get help
    if (process.argv.length == 2) {
        process.argv.push('-h')
    }

    const packageInfo = getPackageInfo();
    const program = new Command();
    program
        .name(packageInfo.name)
        .usage([
            "", "",
            "1. -s http://localhost:8080/api.json -o dist",
            "2. -s source/api.json -o open-api"
        ].join('\r\n'))
        .description(packageInfo.description)
        .version(packageInfo.version, '-v, --version', 'output the current version')

        .requiredOption('-s, --source <source>', 'The path or url to an open-api json file')
        .requiredOption('-o, --output <outputPath>', 'The path where files are generated to')
        .option('-f, --force', 'Force generation also if validation fails')
        .option('-i, --interceptor', 'Force in service class to add an interceptor',false)
        .option('-d, --debug', 'Print debug messages')
        //TODO: write own commander does not support jsOnly and js as option
        .option('-l, --language [language]', 'choose your language (js, jsOnly, ts)',/(ts|js|onlyJs)/,'ts')
        .option('-n, --suffix <ServiceSuffix> ', 'the suffix for an generated service class','Service')
        .option('-r, --react', 'create react provider component',false)
        .option('-t, --static', 'create static services',false)
        .option('-c, --config <path>', 'the url to an config js')

        .action((options) => {
                executeGenerationAction(
                    options.source,
                    options.output,

                    {
                        serviceSuffix: options.suffix,
                        language: options.language,
                        force: !!options.force,

                        forceInterceptor: !!options.interceptor,
                        createStaticServices: !!options.static,
                        verbose: !!options.debug,
                        react: !!options.react,
                        config: options.config
                    }
                )
            }
        );

    program.parse(process.argv);
})();








