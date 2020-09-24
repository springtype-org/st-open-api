import {Ref} from "../classes/ref";
import {OBJECT_REFERENCES} from "../classes/object-property";
import {FolderManager} from "../classes/folder-manager";

export const initReference = (folder: FolderManager): Ref => {
    const ref = new Ref();

    OBJECT_REFERENCES.map(fun => fun(folder))
        .forEach(httpRef => ref.addReference(httpRef.refKey, {
            folderPath: httpRef.folderPath,
            className: httpRef.className,
            fileName: httpRef.fileName
        }))

    return ref;
}

