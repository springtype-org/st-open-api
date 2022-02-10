#!/usr/bin/env node

import { Command } from 'commander';
import { getPackageInfo } from './function/get-package-info';
import { executeGenerationAction } from './function/execute-generation-action';

import { configuration } from './function/config';
import { printBanner } from './function/printBanner';

(async () => {
  // if nothing added get help
  if (process.argv.length === 2) {
    process.argv.push('-h');
  }

  const packageInfo = getPackageInfo();
  const program = new Command();
  program
    .name(packageInfo.name)
    .usage(['', '', '1. -s http://localhost:8080/api.json -o dist', '2. -s source/api.json -o open-api'].join('\r\n'))
    .description(packageInfo.description)
    .version(packageInfo.version, '-v, --version', 'output the current version')

    .requiredOption('-s, --source <source>', 'The path or url to an open-api json file')
    .requiredOption('-o, --output <outputPath>', 'The path where files are generated to')
    .option('-f, --force', 'Force generation also if validation fails')
    .option('-i, --interceptor', 'Force in service class to add an interceptor', false)
    .option('-d, --debug', 'Print debug messages')
    // TODO: write own commander does not support jsOnly and js as option
    .option('-l, --language [language]', 'choose your language (js, jsOnly, ts)', /(ts|js|onlyJs)/, 'ts')
    .option('-n, --suffix <ServiceSuffix> ', 'the suffix for an generated service class', 'Service')
    .option('-r, --react', 'create react provider component', false)
    .option('-t, --static', 'create static services', false)
    .option('-y, --type', 'use types instead of enumerations')
    .option('-p, --provider <providerName>', 'used to set the provider from "browser" to e.g. "node"', 'node')
    .option('-c, --component', 'only build components, this flag will disable all others', false)

    .action((options) => {
      configuration.setConfig(options);
      printBanner();
      executeGenerationAction();
    });

  program.parse(process.argv);
})();
