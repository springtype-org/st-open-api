import {IOrderedPaths} from "../interface/i-ordered-paths";
import {IOpenApi} from "../interface/open-api-mine/i-open-api";
import {IGenerateConfig} from "../interface/i-generate-config";

export const orderedPath = (openApi: IOpenApi, config: IGenerateConfig): IOrderedPaths => {
    const orderPath: IOrderedPaths = {};

    if (!!openApi.paths) {
        const paths = Object.keys(openApi.paths);
        const groupedPaths = groupPath(paths, config.groupSplitLevel);
        for (const groupName of Object.keys(groupedPaths)) {
            const group = orderPath[groupName] = {};
            const paths: Array<string> = groupedPaths[groupName];
            for (const path of paths) {
                group[path] = openApi.paths[path];
            }
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