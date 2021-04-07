import { firstCharacterUpper } from './first-character-upper';
import { firstCharacterLower } from './first-character-lower';

export type TextCase = 'CamelCase' | 'SnakeCase' | 'PascalCase' | 'KebabCase';
export const formatText = (str: string, from: TextCase | 'ANY', to: TextCase): string => {
  let strings = [];

  switch (from) {
    case 'PascalCase':
    case 'CamelCase': {
      strings = str.split(/(?=[A-Z])/).filter((v) => !!v);
      break;
    }
    case 'SnakeCase': {
      strings = str.split('_').filter((v) => !!v);
      break;
    }
    case 'KebabCase': {
      strings = str.split('-').filter((v) => !!v);
      break;
    }
    case 'ANY': {
      strings = str
        .split(/(?=[A-Z])/)
        .map((v) => v.split('_'))
        .reduce((acc, x) => acc.concat(x), [])
        .map((v) => v.split('-'))
        .reduce((acc, x) => acc.concat(x), [])
        .filter((v) => !!v);
    }
  }
  switch (to) {
    case 'PascalCase': {
      return strings.map((v) => firstCharacterUpper(v)).join('');
    }
    case 'CamelCase': {
      return firstCharacterLower(strings.map((v) => firstCharacterUpper(v)).join(''));
    }
    case 'SnakeCase': {
      return strings.join('_').toLowerCase();
    }
    case 'KebabCase': {
      return strings.join('-').toLowerCase();
    }
  }
};
