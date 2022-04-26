export const addPrefix =
  (prefix: string) =>
  (value: string | number | boolean | undefined): string | undefined => {
    if ((!Number.isNaN(value) && typeof value !== 'undefined') || value === '') {
      return prefix + value;
    }
    return undefined;
  };
