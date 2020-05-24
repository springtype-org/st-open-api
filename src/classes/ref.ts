import {relative, sep} from "path";

export class Ref {
    refs: { [ref: string]: IRef } = {};


    getImportAndTypeByRef = (ref: string, path: string): IRefResult => {
        const reference = this.refs[ref];
        let relativePath = relative(path, reference.folderPath).split(sep).join('/');
        if (!relativePath) {
            relativePath = './';
        } else {
            relativePath += '/';
        }
        return {
            className: reference.className,
            import: `import {${reference.className}} from '${relativePath}${reference.fileName}';`
        }
    }

    addReference = (refKey: string, data: IRef) => {
        this.refs[refKey] = {
            fileName: data.fileName,
            className: data.className,
            folderPath: data.folderPath
        }
    }

}

export interface IRef {
    fileName: string,
    className: string,
    folderPath: string
}

export interface IRefResult {
    import: string,
    className: string
}