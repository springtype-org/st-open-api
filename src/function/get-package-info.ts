import {readFileSync} from "fs";

export interface IPackageInfo {
    name: string;
    version: string;
    description: string;
}

export const getPackageInfo = (): IPackageInfo => {
    return JSON.parse(readFileSync('package.json').toString('utf-8'));
}