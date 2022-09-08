import { isUri } from 'valid-url';
import { readFileSync, rmSync, writeFileSync } from 'fs';
import Ajv from 'ajv';
import YAML from 'yaml';
import { join } from 'path';
import OPEN_API_SCHEMA from 'ajv/lib/refs/json-schema-draft-04.json';
import { download } from './download';
import { copyResources } from './copyResources';
import { transpileToJs } from './transpileToJs';
import { getPackageInfo } from './getPackageInfo';
import { createComponents } from '../component/schemas/createComponents';
import { saveApiFile } from './saveApiFile';
import { createServiceClasses } from '../service/createServiceClasses';
import { addParameterReference } from '../component/parameters/addParameterReference';
import { Configuration } from '../classes/Configuration';

const getSource = async (source: string): Promise<{ contentType: string; data: string }> => {
  if (isUri(source)) {
    return download(source);
  }
  return { contentType: source.split('.').pop(), data: readFileSync(source).toString('utf-8') };
};

export type SpecMimeType = 'yaml' | 'json';

export const getSpecMimeType = (contentType: string): SpecMimeType => {
  const lowerCaseContentType = contentType.split(';')[0].toLowerCase();
  switch (lowerCaseContentType) {
    case 'yaml':
    case 'yml':
    case 'text/x-yaml':
    case 'text/yaml':
    case 'text/yml':
    case 'application/x-yaml':
    case 'application/x-yml':
    case 'application/yaml':
    case 'application/yml':
      return 'yaml';
    case 'json':
    case 'application/json':
      return 'json';
    default:
      console.log('Unknown mime type "' + lowerCaseContentType + '"');
      return 'yaml';
  }
};

const JSON_SCHEMA_3_0_X = JSON.parse(
  readFileSync(join(__dirname, '..', 'schema/open-api-3-0-x.json')).toString('utf-8'),
);

const validate = async (openApiSchema: object): Promise<boolean> => {
  const ajv = Ajv({ schemaId: 'auto', allErrors: true });
  ajv.addMetaSchema(OPEN_API_SCHEMA);
  const valid = ajv.validate(JSON_SCHEMA_3_0_X, openApiSchema);
  if (!valid) {
    console.log(ajv.errors);
  }
  return valid;
};

// TODO: build pipeline pattern
export const executeGenerationAction = async (configuration: Configuration) => {
  const logger = configuration.getLogger();
  //configuration.print();
  rmSync(configuration.getOutputFolder(), { recursive: true });

  try {
    let openApiSpec;
    const openApiFileName = configuration.getSource();
    const { contentType, data: openApiRawData } = await getSource(openApiFileName);
    const isYamlFile =
      openApiFileName.endsWith('.yaml') || openApiFileName.endsWith('.yml') || getSpecMimeType(contentType) === 'yaml';

    if (isYamlFile) {
      openApiSpec = YAML.parse(openApiRawData);
    } else {
      openApiSpec = JSON.parse(openApiRawData);
    }

    const valid = await validate(openApiSpec);

    logger.debug('OpenApi Json is valid :', valid);

    if (valid || configuration.ignoreValidation()) {
      logger.debug('Initialize references');
      const folderManager = configuration.getFolderManager();

      createComponents(openApiSpec.components, configuration);
      // save open api.json
      saveApiFile(isYamlFile, openApiRawData, configuration);
      // save creation info
      const packageInfo = getPackageInfo();
      const versionInfo = join(folderManager.getOutputFolder(), 'version.json');

      if (!configuration.isComponentOnly()) {
        const date = new Date();

        writeFileSync(
          versionInfo,
          JSON.stringify(
            {
              version: packageInfo.version,
              creation: `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`,
              path: configuration.getSource(),
            },
            null,
            2,
          ),
        );

        createServiceClasses(openApiSpec.paths, configuration);

        copyResources(configuration);
      }

      const language = configuration.getLanguage();
      if (language === 'js' || language === 'onlyJs') {
        transpileToJs(configuration);
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