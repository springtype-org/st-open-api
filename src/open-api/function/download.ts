import fetch from 'node-fetch';

export const download = async (url: string, settings = { method: 'GET' }) => {
  const response = await fetch(url, settings);
  if (response.status !== 200) {
    throw new Error(`Error getting resource ${url} status ${response.status}.`);
  }
  return response.text();
};
