import {IOrderedPaths} from "../interface/i-ordered-paths";
import {IOpenApi} from "../interface/open-api-mine/i-open-api";
import {IGenerateConfig} from "../interface/i-generate-config";
import {configuration} from "./config";

export const orderedPath = (openApi: IOpenApi): IOrderedPaths => {
    const orderPath: IOrderedPaths = {};

    if (!!openApi.paths) {
        for (const path of Object.keys(openApi.paths)) {
            let manipulatedPath = path;
            if (manipulatedPath.startsWith('/')) {
                manipulatedPath = manipulatedPath.substring(1);
            }
            const pathParts = manipulatedPath.split('/');
            const groupName = pathParts[0] + '-'+configuration.getServiceSuffix();

            let group = orderPath[groupName];
            if (!group) {
                group = {}
                orderPath[groupName] = group;
            }
            group[path] = openApi.paths[path];
        }
    }
    return orderPath;
}

const normalizePath = (path: string) => {
    if (path.startsWith('/')) {
        return path.substring(1);
    }
    return path;
}

export const groupPath = (paths: Array<string>, pathSplitLevel: number = 0): GroupedPath => {
    const groupedPaths: GroupedPath = {};
    for (const path of paths) {
        let manipulatedPath = normalizePath(path);

        const pathParts = manipulatedPath.split('/');
        const groupName = pathParts[pathSplitLevel] + 'Service';
        let group = groupedPaths[groupName];
        if (!group) {
            group = []
            groupedPaths[groupName] = group;
        }
        group.push(path)
    }
    return groupedPaths;
}

export interface GroupedPath {
    [groupName: string]: Array<string>
}
