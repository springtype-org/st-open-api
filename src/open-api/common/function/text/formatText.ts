import { isAlphaCase } from './IsAlphaCase';
import { isLowerCase } from './isLowerCase';

export const firstCharacterUpper = (str: string) => !!str && str[0].toUpperCase() + str.slice(1);
export const firstCharacterLower = (str: string) => !!str && str[0].toLowerCase() + str.slice(1);

export type TextCase = 'CamelCase' | 'SnakeCase' | 'PascalCase' | 'KebabCase';

export const fromCamelCase = (str: string): Array<string> => {
  const intermediateResult = str.split(/(?=[A-Z])/).filter((v) => !!v);
  if (intermediateResult.length <= 1) {
    return intermediateResult;
  }
  const result: Array<string> = [];
  let lastElement = intermediateResult[0];

  for (let i = 1; i < intermediateResult.length; i++) {
    const currentElement = intermediateResult[i];
    const lastCharacter = lastElement.substring(currentElement.length - 2, 1);
    const currentCharacter = currentElement.substring(0, 1);

    const lastIsLowerCase = isAlphaCase(lastCharacter) && isLowerCase(lastCharacter);
    const currentIsLowerCase = isAlphaCase(currentCharacter) && isLowerCase(currentCharacter);
    const isChange = lastIsLowerCase !== currentIsLowerCase;
    if (isChange) {
      result.push(lastElement);
      lastElement = currentElement;
    } else {
      lastElement += currentElement;
    }
  }
  result.push(lastElement);
  return result;
};

export const fromPascalCase = fromCamelCase;
export const fromSnakeCase = (str: string): Array<string> => str.split('_').filter((v) => !!v);
export const fromKebabCase = (str: string): Array<string> => str.split('-').filter((v) => !!v);
export const fromAny = (str: string): Array<string> =>
  fromCamelCase(str)
    .flatMap((v) => fromSnakeCase(v))
    .flatMap((v) => fromKebabCase(v))
    .filter((v) => !!v);

export const FROM_CASE_MAP: Record<TextCase | 'Any', (str: string) => Array<string>> = {
  CamelCase: fromCamelCase,
  PascalCase: fromPascalCase,
  SnakeCase: fromSnakeCase,
  KebabCase: fromKebabCase,
  Any: fromAny,
};

export const toPascalCase = (parts: Array<string>): string =>
  parts
    .map((v) => v.toLowerCase())
    .map((v) => firstCharacterUpper(v))
    .join('');
export const toCamelCase = (parts: Array<string>): string => firstCharacterLower(toPascalCase(parts));
export const toSnakeCase = (parts: Array<string>): string =>
  parts
    .map((v) => v.toUpperCase())
    .join('_')
    .toLowerCase();
export const toKebabCase = (parts: Array<string>): string => parts.join('-').toLowerCase();

export const TO_CASE_MAP: Record<TextCase, (parts: Array<string>) => string> = {
  CamelCase: toCamelCase,
  PascalCase: toPascalCase,
  SnakeCase: toSnakeCase,
  KebabCase: toKebabCase,
};

export const formatText = (strs: Array<string>, from: TextCase | 'Any', to: TextCase): string => {
  const parts: Array<string> = strs
    .flatMap((str) => FROM_CASE_MAP[from](str))
    .filter((v) => !!v)
    .map((v) => v.toLowerCase());
  return TO_CASE_MAP[to](parts);
};
