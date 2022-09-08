import {
  createProgram,
  Diagnostic,
  flattenDiagnosticMessageText,
  getPreEmitDiagnostics,
  parseConfigFileTextToJson,
  parseJsonConfigFileContent,
  sys,
} from 'typescript';
import { unlinkSync } from 'fs';
import { Configuration } from '../classes/Configuration';

function reportDiagnostics(diagnostics: Diagnostic[]): void {
  const errors = diagnostics.map((diagnostic) => {
    let message = 'Error';
    if (diagnostic.file) {
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
      message += ` ${diagnostic.file.fileName} (${line + 1},${character + 1})`;
    }
    message += `: ${flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`;
    return message;
  });

  if (errors && errors.length > 0) {
    throw new Error(`Typescript Errors: \n${errors.map((v) => ` - ${v}`).join('\n')}`);
  }
}

function getConfiguration(outputDirectory: string, includeTSX = false) {
  const options: any = {};
  if (includeTSX) {
    options.jsx = 'preserve';
  }

  // Parse JSON, after removing comments. Just fancier JSON.parse
  const result = parseConfigFileTextToJson(
    '',
    JSON.stringify({
      compilerOptions: {
        declaration: true,
        rootDirs: [outputDirectory],
        ...options,
      },
    }),
  );
  const configObject = result.config;
  if (!configObject) {
    reportDiagnostics([result.error]);
  }

  // Extract config information
  const configParseResult = parseJsonConfigFileContent(configObject, sys, outputDirectory);
  if (configParseResult.errors.length > 0) {
    reportDiagnostics(configParseResult.errors);
  }
  return configParseResult;
}

export const transpileToJs = (configuration: Configuration) => {
  // Extract configuration from config file
  const config = getConfiguration(configuration.getOutputFolder());

  // Compile
  const program = createProgram(config.fileNames, config.options);
  const emitResult = program.emit();

  // Report errors
  reportDiagnostics(getPreEmitDiagnostics(program).concat(emitResult.diagnostics));

  config.fileNames.forEach((tsFile) => {
    if (configuration.getLanguage() === 'onlyJs') {
      const dTsFile = tsFile.replace(/\.tsx|\.ts/i, '.d.ts');
      unlinkSync(dTsFile);
    }
    unlinkSync(tsFile);
  });

  // Return code
  if (emitResult.emitSkipped) {
    throw new Error('Emit skipped ...');
  }
};
