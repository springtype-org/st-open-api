export const splitByLineBreak = (str: string): Array<string> => {
  if (str) {
    return str.split('\r').join('').split('\n');
  }
  return [];
};
