import { MainContext } from './pipeline';
import { AbstractAction } from '../pipeline/AbstractAction';
import { rmSync } from 'fs';
export class ClearOutputAction extends AbstractAction<MainContext> {
  getName() {
    return ClearOutputAction.name;
  }

  async run(context: MainContext): Promise<void> {
    const outputFolder = context.config.getOutputFolder();
    rmSync(outputFolder, { recursive: true });
  }
}
