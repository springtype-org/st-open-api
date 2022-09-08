import { MainContext } from './pipeline';
import { AbstractAction } from '../pipeline/AbstractAction';
import { createComponents } from '../component/schemas/createComponents';
import { createServiceClasses } from '../service/createServiceClasses';
import { addParameterReference } from '../component/parameters/addParameterReference';

export class CeatetAction extends AbstractAction<MainContext> {
  getName() {
    return CeatetAction.name;
  }

  async run(context: MainContext): Promise<void> {
    const components = context.openApi.parsed.components;
    const paths = context.openApi.parsed.paths;

    // add parameter references
    addParameterReference(components, context.config);

    createComponents(components, context.config);
    createServiceClasses(paths, context.config);
  }
}
