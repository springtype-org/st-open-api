import { relative, sep } from 'path';

export const GROUP_SERVICE = 'SERVICE';
export const GROUP_NO_AUTH_SERVICE = 'SERVICE_NO_AUTH';

export class Register {
  refs: { [ref: string]: IRef } = {};

  groups: { [group: string]: Array<IRef & { refKey: string }> } = {};

  getImportAndTypeByRef = (ref: string, path: string): IRefResult => {
    const reference = this.refs[ref];
    let relativePath = relative(path, reference.folderPath).split(sep).join('/');
    if (!relativePath) {
      relativePath = './';
    } else {
      if (!relativePath.startsWith('../')) {
        relativePath = `./${relativePath}`;
      }
      relativePath += '/';
    }
    return {
      className: reference.className,
      import: `import {${reference.className}} from '${relativePath}${reference.fileName}';`,
      importPath: relativePath + reference.fileName,
      fileName: reference.fileName,
    };
  };

  addReference = (refKey: string, refData: IRef, group: string | undefined = undefined) => {
    this.refs[refKey] = refData;
    if (group) {
      let groupArr = this.groups[group];
      if (!groupArr) {
        groupArr = [];
        this.groups[group] = groupArr;
      }
      groupArr.push({ ...refData, refKey });
    }
  };

  getByGroup(group: string) {
    return this.groups[group] || [];
  }
}

export interface IRef {
  fileName: string;
  className: string;
  folderPath: string;
  definition?: any;
}

export interface IRefResult {
  import: string;
  className: string;
  importPath: string;
  fileName: string;
}
