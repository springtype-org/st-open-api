export const createRefKey = (prefix: string, schemaName: string) => {
  const parts = prefix.split('/');
  parts.push(schemaName);
  return parts.filter((v) => !!v).join('/');
};
