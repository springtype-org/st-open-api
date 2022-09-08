import { MainContext } from './pipeline';
import { writeFileSync } from 'fs';
import { join } from 'path';
import YAML from 'yaml';
import { AbstractAction } from '../pipeline/AbstractAction';
import { relative } from 'path';
import jsonStringify from 'json-stable-stringify';
import yaml from 'js-yaml';

export class SaveFilesAction extends AbstractAction<MainContext> {
  getName() {
    return SaveFilesAction.name;
  }

  async run(context: MainContext): Promise<void> {
    const currentDate = new Date();
    const folderManager = context.config.getFolderManager();
    const logger = context.logger;

    const parsed = context.openApi.parsed;
    const references = Object.entries(context.config.getReference().refs)
      .map(([key, value]) => ({
        key,
        ...value,
        folderPath: relative(context.config.getOutputFolder(), value.folderPath),
      }))
      .reduce((prev, value) => {
        delete value.schema;
        prev[value.key] = value;
        delete value.key;
        return prev;
      }, {});

    const openApiFilePathWithoutExtension = join(folderManager.getOutputFolder(), 'open-api');
    const fileRegistryFilePathWithoutExtension = join(folderManager.getOutputFolder(), 'references');
    const versionInfoPath = join(folderManager.getOutputFolder(), 'version.json');

    writeFileSync(openApiFilePathWithoutExtension + '.json', JSON.stringify(parsed, null, 2));
    writeFileSync(openApiFilePathWithoutExtension + '.yaml', YAML.stringify(parsed, { indent: 2 }));

    // writeFileSync(fileRegistryFilePathWithoutExtension + '.json', jsonStringify(references, { space: 2 }));
    // writeFileSync(fileRegistryFilePathWithoutExtension + '.yaml', yaml.dump(references, { indent: 2, sortKeys: true }));

    writeFileSync(
      versionInfoPath,
      JSON.stringify(
        {
          version: context.packageJson.version,
          creation: `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`,
          path: context.config.getSource(),
          config: context.config.getConfig(),
        },
        null,
        2,
      ),
    );
    logger.debug('-Saved files open-api.json|yaml version.json');
  }
}
