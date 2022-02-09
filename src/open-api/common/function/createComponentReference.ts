import { createClassName } from './createClassName';
import { createFileName } from './createFileName';
import { createRefKey } from './createRefKey';

export type ComponentRefOptions = {
  createClassName: (schemaName: string) => string;
  createFileName: (schemaName: string) => string;
  createRefKey: (prefixPath: string, schemaName: string) => string;
};

export type ComponentRef = {
  className: string;
  fileName: string;
  refKey: string;
};

export const DEFAULT_OPTIONS: ComponentRefOptions = {
  createClassName,
  createFileName,
  createRefKey,
};

export const getComponentRefOptions = (options: Partial<ComponentRefOptions> | undefined): ComponentRefOptions => ({
  createFileName: options?.createFileName || DEFAULT_OPTIONS.createFileName,
  createClassName: options?.createClassName || DEFAULT_OPTIONS.createClassName,
  createRefKey: options?.createRefKey || DEFAULT_OPTIONS.createRefKey,
});

export const createComponentReference = (
  schemaName: string,
  refkey: string,
  partialOptions: Partial<ComponentRefOptions> = DEFAULT_OPTIONS,
) => {
  const options = getComponentRefOptions(partialOptions);

  const className = options.createClassName(schemaName);
  const fileName = options.createFileName(schemaName);

  const refKey = options.createRefKey(refkey, schemaName);

  return {
    className,
    fileName,
    refKey,
  };
};
