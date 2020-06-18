import {
    createProgram,
    Diagnostic,
    flattenDiagnosticMessageText,
    getPreEmitDiagnostics,
    parseConfigFileTextToJson,
    parseJsonConfigFileContent,
    sys
} from "typescript";
import {IOpenApiOpt} from "../interface/i-open-api-opt";
import {deletePathOrFile} from "st-rm-rf";


function reportDiagnostics(diagnostics: Diagnostic[]): void {
    const errors = diagnostics.map(diagnostic => {
        let message = "Error";
        if (diagnostic.file) {
            let {line, character} = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
            message += ` ${diagnostic.file.fileName} (${line + 1},${character + 1})`;
        }
        message += ": " + flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        return message
    });

    if (errors && errors.length > 0) {
        throw new Error(`Typescript Errors: \n${errors.map(v => ' - ' + v).join('\n')}`)
    }
}

function getConfiguration(outputDirectory: string) {
    // Parse JSON, after removing comments. Just fancier JSON.parse
    const result = parseConfigFileTextToJson('', JSON.stringify({

            compilerOptions: {
                declaration: true,
                rootDirs: [
                    outputDirectory
                ]
            }
        }
    ));
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

export const transpileToJs = (outputDirectory: string, conf: IOpenApiOpt) => {

    // Extract configuration from config file
    let config = getConfiguration(outputDirectory);

    // Compile
    let program = createProgram(config.fileNames, config.options);
    let emitResult = program.emit();

    // Report errors
    reportDiagnostics(getPreEmitDiagnostics(program).concat(emitResult.diagnostics));

    config.fileNames.map(f => deletePathOrFile(f, {printError: true, printInfo: false, printWarning: false}))

    // Return code
    if (emitResult.emitSkipped) {
        throw new Error('Emit skipped ...')
    }
}
