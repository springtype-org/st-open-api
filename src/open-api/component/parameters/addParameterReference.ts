import { IComponents } from '../../interface/open-api-mine/i-components';
import { configuration, Configuration } from '../../function/config';

export const addParameterReference = (components: IComponents | undefined, config: Configuration = configuration) => {
  if (components.parameters) {
    const logger = config.getLogger();
    logger.info('Register parameter schemas');
    const register = config.getParameterRegister();
    for (const parameter of Object.keys(components.parameters)) {
      logger.debug('- register parameter ' + parameter);
      register.add(`#/components/parameters/${parameter}`, components.parameters[parameter]);
    }
    logger.debug('Register parameter done');
  }
};
