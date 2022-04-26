export const joinString =
  (separator: string) =>
  (...values: Array<string | undefined>) => {
    const response = values
      .filter((v) => {
        if (typeof v === 'undefined') {
          return false;
        }
        return v !== '';
      })
      .join(separator);
    if (!!response) {
      return response;
    }
    return undefined;
  };
