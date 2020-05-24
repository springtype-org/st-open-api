import {Ref} from "../classes/ref";
import {HTTP_FUNCTION_REF, OPEN_API_FUNCTION_REF, QUERY_PARAMETER_FUNCTION_REF} from "../classes/object-property";
import {FolderManager} from "../classes/folder-manager";

export const initReference = (folder: FolderManager): Ref => {
    const ref = new Ref();

    const httpFunction = HTTP_FUNCTION_REF(folder);
    ref.addReference(httpFunction.refKey, {
        folderPath: httpFunction.folderPath,
        className: httpFunction.className,
        fileName: httpFunction.fileName
    })
    const openApiFunction = OPEN_API_FUNCTION_REF(folder);
    ref.addReference(openApiFunction.refKey, {
        folderPath: openApiFunction.folderPath,
        className: openApiFunction.className,
        fileName: openApiFunction.fileName
    })

    const queryParameterFunction = QUERY_PARAMETER_FUNCTION_REF(folder);
    ref.addReference(queryParameterFunction.refKey, {
        folderPath: queryParameterFunction.folderPath,
        className: queryParameterFunction.className,
        fileName: queryParameterFunction.fileName
    })
    return ref;
}

