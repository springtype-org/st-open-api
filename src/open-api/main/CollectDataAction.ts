import { MainContext } from './pipeline';
import YAML from 'yaml';
import { existsSync } from 'fs';
import { AbstractAction } from '../pipeline/AbstractAction';
import { getPackageInfo } from '../function/getPackageInfo';
import { IOpenApi } from '../interface/open-api-mine/i-open-api';
import { SourceType } from '../interface/SourceType';
import { getFileOrUri } from '../function/getFileOrUri';

export class CollectDataAction extends AbstractAction<MainContext> {
  getName() {
    return CollectDataAction.name;
  }

  async run(context: MainContext): Promise<void> {
    context.packageJson = getPackageInfo();
    const logger = context.logger;
    const sourceFileOrUri = context.config.getSource();
    const raw = await getFileOrUri(sourceFileOrUri, logger);

    let parsed: IOpenApi;
    let type: SourceType;
    try {
      parsed = JSON.parse(raw);
      type = 'JSON';
      logger.debug('-Found json file');
    } catch (e) {
      //do nothing
    }
    if (typeof parsed === 'undefined') {
      try {
        parsed = YAML.parse(raw);
        type = 'YAML';
        logger.debug('-Found yaml file');
      } catch (e) {
        //do nothing
      }
    }
    if (typeof parsed === 'undefined') {
      throw new Error(`Unable to parse Open-api file source(${sourceFileOrUri})`);
    }

    context.openApi = {
      type,
      raw,
      parsed,
    };

    const configFilePath = context.config.getConfig().config;
    if (existsSync(configFilePath)) {
      const rawConfigFile = getFileOrUri(configFilePath, logger);
      //todo: do it later
    }
  }
}
