import { isUri } from 'valid-url';
import { readFileSync, writeFileSync } from 'fs';
import Ajv from 'ajv';
import YAML from 'yaml';
import { join } from 'path';
import OPEN_API_SCHEMA from 'ajv/lib/refs/json-schema-draft-04.json';
import { download } from './download';
import { copyResources } from './copy-resources';
import { createServiceClasses } from './create-service-classes';
import { transpileToJs } from './transpile-to-js';
import { createReactProvider } from './create-react-provider';
import { createStaticServices } from './create-static-services';
import { configuration } from './config';
import { initServiceReference } from './init-references';
import { getPackageInfo } from './get-package-info';
import { createComponents } from '../component/createComponents';
import { saveApiFile } from './saveApiFile';

const getSourceAsString = async (source: string): Promise<string> => {
  if (isUri(source)) {
    return download(source);
  }
  return readFileSync(source).toString('utf-8');
};

export type SpecMimeType = 'yaml' | 'json';

export const getSpecMimeType = (filePath: string): SpecMimeType => {
  const lowerCasedFilePath = filePath.toLowerCase();
  if (lowerCasedFilePath.indexOf('.yaml') > -1) {
    return 'yaml';
  }
  return 'json';
};

const JSON_SCHEMA_3_0_X = JSON.parse(
  readFileSync(join(__dirname, '..', 'schema/open-api-3-0-x.json')).toString('utf-8'),
);

const validate = async (openApiSchema: object): Promise<boolean> => {
  const ajv = Ajv({ schemaId: 'auto', allErrors: true });
  ajv.addMetaSchema(OPEN_API_SCHEMA);
  const valid = ajv.validate(JSON_SCHEMA_3_0_X, openApiSchema);
  if (!valid && configuration.isDebug()) {
    console.log(ajv.errors);
  }
  return valid;
};

export const executeGenerationAction = async () => {
  const logger = configuration.getLogger();
  configuration.print();

  try {
    let openApiSpec;
    const openApiFileName = configuration.getOpenApiFile();
    const openApiRawData = await getSourceAsString(openApiFileName);
    const isYamlFile = getSpecMimeType(openApiFileName) === 'yaml';

    if (isYamlFile) {
      openApiSpec = YAML.parse(openApiRawData);
    } else {
      openApiSpec = JSON.parse(openApiRawData);
    }

    const valid = await validate(openApiSpec);

    logger.debug('OpenApi Json is valid :', valid);

    if (valid || configuration.ignoreValidation()) {
      logger.debug('Initialize references');

      createComponents(openApiSpec.components);

      if (!configuration.isComponentOnly()) {
        const folderManager = configuration.getFolderManager();
        initServiceReference(folderManager);

        // save open api.json
        saveApiFile(isYamlFile, openApiRawData);
        // save creation info
        const packageInfo = getPackageInfo();
        const versionInfo = join(folderManager.getOutputFolder(), 'version.json');
        const date = new Date();
        writeFileSync(
          versionInfo,
          JSON.stringify(
            {
              version: packageInfo.version,
              creation: `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`,
              path: configuration.getOpenApiFile(),
            },
            null,
            2,
          ),
        );

        createServiceClasses(openApiSpec);

        if (configuration.isCreateReactProvider()) {
          createReactProvider();
        }

        if (configuration.isCreateStaticServices()) {
          createStaticServices();
        }
        copyResources();
      }

      const language = configuration.getLanguage();
      if (language === 'js' || language === 'onlyJs') {
        transpileToJs();
      }
    } else {
      logger.warn('OpenApi Json not valid.');
      process.exit(1);
      return;
    }
  } catch (e) {
    logger.warn(e.message);
    process.exit(1);
  }
};
