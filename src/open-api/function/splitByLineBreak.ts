export const splitByLineBreak = (str: string): Array<string> => {
  if (str) {
    return str.split('\r\n').join('').split('\n');
  }
  return [];
};
