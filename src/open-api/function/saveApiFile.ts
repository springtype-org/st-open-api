import { join } from 'path';
import { writeFileSync } from 'fs';
import YAML from 'yaml';
import { Configuration, configuration } from './config';

export const saveApiFile = (
  isYamlFile: boolean,
  openApiRawData: string,
  config: Configuration = configuration,
) => {
  const folderManager = config.getFolderManager();
  const logger = config.getLogger();

  const schemaFilePath = join(
    folderManager.getOutputFolder(),
    'open-api.' + isYamlFile ? 'yaml' : 'json',
  );

  writeFileSync(
    schemaFilePath,
    isYamlFile
      ? YAML.stringify(YAML.parse(openApiRawData), { indent: 2 })
      : JSON.stringify(JSON.parse(openApiRawData), null, 2),
  );
  logger.debug('Saved open api file ' + schemaFilePath);
};
