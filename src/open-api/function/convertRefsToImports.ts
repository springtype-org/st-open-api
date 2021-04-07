import { IRefResult } from '../classes/ref';

export const convertRefsToImports = (refs: Array<IRefResult>): Array<string> => {
  const importMap: { [path: string]: { [className: string]: true } } = {};
  refs
    .filter((ref) => !!ref)
    .forEach((ref) => {
      const { className, importPath } = ref;
      const importPathMap = importMap[importPath] || {};
      importPathMap[className] = true;
      importMap[importPath] = importPathMap;
    });

  const importList: { [path: string]: string } = {};
  Object.entries(importMap).forEach(([path, classNames]) => {
    importList[path] = Object.keys(classNames).join(', ');
  });
  const sortedFilePaths = Object.keys(importList).sort();
  return sortedFilePaths.map((filePath) => `import { ${importList[filePath]} } from '${filePath}'`);
};
