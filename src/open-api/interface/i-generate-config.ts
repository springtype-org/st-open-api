import { Register } from '../classes/register';
import { FolderManager } from '../classes/folder-manager';

export interface IGenerateConfig {
  ref: Register;
  folder: FolderManager;
  serviceSuffix: string;
  verbose: boolean;
  force: boolean;
  forceInterceptor: boolean;
  createStaticServices: boolean;
}
