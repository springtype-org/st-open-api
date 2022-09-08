#!/usr/bin/env node

import { Command } from 'commander';
import { getPackageInfo } from './function/getPackageInfo';

import { Configuration } from './classes/Configuration';
import { MainContext, mainPipeline } from './main/pipeline';
import { ConsoleLogger, LogLevel } from './classes/Logger';
import { printBanner } from './function/printBanner';
import { executeGenerationAction } from './function/executeGenerationAction';

export type Language = 'ts' | 'js' | 'onlyJs';

export interface BaseConfiguration {
  source: string;
  output: string;
  config: string;
  force: boolean;
  onlyComponents: boolean;
  logLevel: LogLevel;
  language: Language;
}

export const cli = async (execute: (options: BaseConfiguration) => Promise<void>) => {
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

    .option('-s, --source <source>', 'The path or url to an open-api json file')
    .option('-o, --output <outputPath>', 'The path where files are generated to')
    .option('-c, --config <configPath>', 'direction to config', 'open-api-config.json')
    .option('-f, --force', 'Ignore file validation', false)
    .option('-l, --logLevel [level]', 'Set log level', /(DEBUG|WARN|INFO|ERROR)/, 'INFO')
    .option('-t, --language [language]', 'choose your language (js, jsOnly, ts)', /(ts|js|onlyJs)/, 'ts')
    .option('-g, --onlyComponents', 'Generate only components classes', false)

    .action((options: BaseConfiguration) => {
      execute({
        logLevel: options.logLevel,
        onlyComponents: options.onlyComponents,
        force: options.force,
        source: options.source,
        output: options.output,
        config: options.config,
        language: options.language,
      });
    });

  program.parse(process.argv);
};

cli(async (cliConfig: BaseConfiguration) => {
  printBanner();

  const logger = new ConsoleLogger(cliConfig.logLevel);
  const config = new Configuration(cliConfig, logger);

  //await executeGenerationAction(config);

  const context: MainContext = {
    config,
    logger,
  } as any;

  await mainPipeline.execute(context);
});
