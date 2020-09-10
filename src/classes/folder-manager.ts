import {join,isAbsolute} from "path";
import {existsSync, mkdirSync} from "fs";
import {deletePathOrFile} from "st-rm-rf";

export const mkdir = (path: string) => {
    if (!existsSync(path)) {
        mkdirSync(path, {recursive: true})
    }
    return path;
}
const resolvePath = (outputFolder) => {
    if (!isAbsolute(outputFolder)) {
        return join(process.cwd(), outputFolder);
    }
    return outputFolder;
}
export class FolderManager {
    private readonly outputFolder: string;

    constructor(outputFolder: string) {
        this.outputFolder = resolvePath(outputFolder);
        deletePathOrFile(this.outputFolder, {printInfo: false, printWarning: false, printError: true});
    }

    getOutputFolder(){
        return this.outputFolder;
    }

    getServiceFolder() {
        return mkdir(join(this.outputFolder, 'service'))
    }

    getFunctionFolder() {
        return mkdir(join(this.outputFolder, 'function'));
    }

    getInterfaceFolder() {
        return mkdir(join(this.outputFolder, 'interface'));
    }

    getEnumerationFolder() {
        return mkdir(join(this.outputFolder, 'enumeration'));
    }

    getReactProviderFolder() {
        return mkdir(join(this.outputFolder, 'provider'));
    }

    getConstantServicesFolder() {
        return mkdir(join(this.outputFolder, 'constant'));
    }

    getInterfaceComponentsFolder() {
        return mkdir(join(this.getInterfaceFolder(), 'components'));
    }

    getInterfaceRequestFolder() {
        return mkdir(join(this.getInterfaceFolder(), 'request'));
    }

    getInterfaceResponseFolder() {
        return mkdir(join(this.getInterfaceFolder(), 'response'));
    }

    getInterfaceParameterFolder() {
        return mkdir(join(this.getInterfaceFolder(), 'parameter'));
    }
}
