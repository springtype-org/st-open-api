import {IOrderedPaths} from "../interface/i-ordered-paths";
import {IOpenApi} from "../interface/open-api-mine/i-open-api";

export const orderedPath = (openApi: IOpenApi): IOrderedPaths => {
    const orderPath: IOrderedPaths = {};
    if (!!openApi.paths) {
        for (const path of Object.keys(openApi.paths)) {
            let manipulatedPath = path;
            if (manipulatedPath.startsWith('/')) {
                manipulatedPath = manipulatedPath.substring(1);
            }
            const pathParts = manipulatedPath.split('/');
            let group = orderPath[pathParts[0]];
            if (!group) {
                group = {}
                orderPath[pathParts[0]] = group;
            }
            group[path] = openApi.paths[path];
        }
    }
    return orderPath;
}