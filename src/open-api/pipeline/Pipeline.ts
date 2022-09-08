import { AbstractAction } from './AbstractAction';
import { Context as PipelineContext } from './Context';

export class Pipeline<Context extends PipelineContext> {
  private failOnAction = true;

  constructor(private actions: Array<AbstractAction<Context>>) {}

  async execute(context: Context): Promise<boolean> {
    let result = true;
    for (const action of this.actions) {
      try {
        await action.run(context);
        context.logger.debug(`--Action(${action.getName()})`);
      } catch (e) {
        result = false;
        if (this.failOnAction) {
          context.logger.error(`--Error-Action(${action.getName()})`);
          context.logger.error(e.message);
          break;
        }
      }
    }
    return result;
  }
}
