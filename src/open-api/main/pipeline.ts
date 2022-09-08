import { PrintAction } from './PrintAction';
import { CollectDataAction } from './CollectDataAction';
import { ValidateParsedSourceAction } from './ValidateParsedSourceAction';
import { SaveFilesAction } from './SaveFilesAction';
import { CeatetAction } from './CeatetAction';
import { Context } from '../pipeline/Context';
import { Configuration } from '../classes/Configuration';
import { SourceType } from '../interface/SourceType';
import { IOpenApi } from '../interface/open-api-mine/i-open-api';
import { PackageJSON } from '../function/getPackageInfo';
import { Pipeline } from '../pipeline/Pipeline';
import { ClearOutputAction } from './ClearOutputAction';

export interface MainContext extends Context {
  config: Configuration;
  openApi: {
    raw: string;
    type: SourceType;
    parsed: IOpenApi;
  };
  packageJson: PackageJSON;
  validate: {
    valid: boolean;
    errors?: any;
  };
}

export const mainPipeline = new Pipeline<MainContext>([
  new ClearOutputAction(),
  new CollectDataAction(),
  new PrintAction(),
  new ValidateParsedSourceAction(),
  new CeatetAction(),
  new SaveFilesAction(),
]);
