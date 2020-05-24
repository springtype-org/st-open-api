import {Ref} from "../classes/ref";
import {FolderManager} from "../classes/folder-manager";

export interface IGenerateConfig {
    ref: Ref,
    folder: FolderManager
    useSpringtype: boolean;
    verbose: boolean;
    force: boolean
}