import {Ref} from "../classes/ref";
import {FolderManager} from "../classes/folder-manager";

export interface IGenerateConfig {
    ref: Ref,
    folder: FolderManager
    serviceSuffix: string;
    verbose: boolean;
    force: boolean
}
