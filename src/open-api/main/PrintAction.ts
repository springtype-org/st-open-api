import { MainContext } from './pipeline';
import { AbstractAction } from '../pipeline/AbstractAction';

export class PrintAction extends AbstractAction<MainContext> {
  async run(context: MainContext): Promise<void> {
    const config = context.config;
    const logger = context.logger;
    logger.info('--Configuration');
    logger.info(`-Source: ${config.getSource()}`);
    logger.info(`-Output: ${config.getOutputFolder()}`);
    logger.info(`-Config: ${config.getConfig().config}`);
    logger.info(`-Log-level: ${logger.getLevel()}`);
    logger.info(`-Ignore validation: ${config.ignoreValidation().toString()}`);
    logger.info(`-Output language: ${config.getLanguage()}`);
    logger.info();
  }

  getName(): string {
    return PrintAction.name;
  }
}
