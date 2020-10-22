import {Ref} from "../classes/ref";
import {SERVICE_REFERENCES} from "../classes/object-property";
import {FolderManager} from "../classes/folder-manager";
import {configuration} from "./config";

export const initServiceReference = (folder: FolderManager) => {
    const ref = configuration.getReference();
    SERVICE_REFERENCES.map(fun => fun(folder))
        .forEach(httpRef => ref.addReference(httpRef.refKey, {
            folderPath: httpRef.folderPath,
            className: httpRef.className,
            fileName: httpRef.fileName
        }))

}

