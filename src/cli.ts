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
        .option('-d, --debug', 'Print debug messages')
        .option('-l, --language [language]', 'choose your language (js, ts)',/(ts|js)/,'ts')
        .option('-n, --suffix <ServiceSuffix> ', 'the suffix for an generated service class','Service')

        .action((options) => {
                executeGenerationAction(
                    options.source,
                    options.output,
                    {
                        serviceSuffix: options.suffix,
                        language: options.language,
                        force: !!options.force,
                        verbose: !!options.debug
                    }
                )
            }
        );

    program.parse(process.argv);
})();








