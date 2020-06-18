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
        .option('-u, --useSpringtype', 'add springtype annotations')
        .option('-f, --force', 'Force generation also if validation fails')
        .option('-d, --debug', 'Print debug messages')
        .option('-l, --language [language]', 'choose your language (js, ts)',/(ts|js)/,'ts')

        .action((options) => {
                executeGenerationAction(
                    options.source,
                    options.output,
                    {
                        language: options.language,
                        force: !!options.force,
                        useSpringtype: !!options.useSpringtype,
                        verbose: !!options.debug
                    }
                )
            }
        );

    /*program.on('--help', () => {
          console.log('');
          console.log('Example call:');
          console.log('  $ custom-help --help');
      });*/

    program.parse(process.argv);
})();








