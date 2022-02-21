import fetch from 'node-fetch';

export const download = async (
  url: string,
  settings = { method: 'GET' },
): Promise<{ contentType: string; data: string }> => {
  const response = await fetch(url, settings);
  const contentType = response.headers.get('content-type');

  if (response.status !== 200) {
    throw new Error(`Error getting resource ${url} status ${response.status}.`);
  }
  return { contentType, data: await response.text() };
};
