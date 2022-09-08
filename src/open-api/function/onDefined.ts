export const onDefined = <T>(value: T | undefined | null, defaultValue: T): T => {
  if (typeof value === 'undefined' || value === null || (typeof value === 'string' && value === '')) {
    return defaultValue;
  }
  return value;
};
