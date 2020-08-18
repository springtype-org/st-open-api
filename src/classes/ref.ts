import {relative, sep} from "path";
export const GROUP_SERVICE = 'SERVICE'

export class Ref {
    refs: { [ref: string]: IRef } = {};
    groups: {[group: string]: Array<IRef & {refKey: string}>} = {};

    getImportAndTypeByRef = (ref: string, path: string): IRefResult => {
        const reference = this.refs[ref];
        let relativePath = relative(path, reference.folderPath).split(sep).join('/');
        console.log('relativePath',relativePath)
        if (!relativePath) {
            relativePath = './';
        } else {
            if(!relativePath.startsWith('../')){
                relativePath = `./${relativePath}`;
            }
            relativePath += '/';
        }
        return {
            className: reference.className,
            import: `import {${reference.className}} from '${relativePath}${reference.fileName}';`
        }
    }

    addReference = (refKey: string, data: IRef, group: string|undefined = undefined) => {
        const ref ={
            fileName: data.fileName,
            className: data.className,
            folderPath: data.folderPath
        };

        this.refs[refKey] = ref;
        if(!!group){
            let groupArr = this.groups[group];
            if(!groupArr){
                groupArr = [];
                this.groups[group] = groupArr;
            }
            groupArr.push({...ref, refKey: refKey});
        }
    }

    getByGroup(group: string) {
        return this.groups[group] || [];
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
