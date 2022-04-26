import { relative, sep } from 'path';

export const GROUP_SERVICE = 'SERVICE';

export class Register {
  refs: { [ref: string]: IRef } = {};

  groups: { [group: string]: Array<IRef & { refKey: string }> } = {};

  getImportAndTypeByRef = (ref: string, path: string): IRefResult | undefined => {
    const reference = this.refs[ref];
    if (reference) {
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
        schema: reference.schema,
      };
    }
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

  getAllGroups(): Array<string> {
    return Object.keys(this.groups);
  }
}

export interface IRef {
  fileName: string;
  className: string;
  folderPath: string;
  schema?: any;
}

export interface IRefResult {
  import: string;
  className: string;
  importPath: string;
  fileName: string;
  schema?: any;
}
