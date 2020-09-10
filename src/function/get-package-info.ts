import {readFileSync} from "fs";
import {join} from "path";

export interface IPackageInfo {
    name: string;
    version: string;
    description: string;
}

export const getPackageInfo = (): IPackageInfo => {
    return JSON.parse(readFileSync(join(__dirname, '..', 'package.json')).toString('utf-8'));
}
