import { Logger } from '../classes/Logger';
import { readFileSync } from 'fs';
import { isUri } from 'valid-url';
import fetch from 'node-fetch';

export const download = async (url: string, logger: Logger): Promise<string> => {
  const response = await fetch(url, { method: 'GET' });
  logger.debug('- downloaded file ' + url);
  if (response.status !== 200) {
    throw new Error(`Error getting resource ${url} status ${response.status}.`);
  }
  return response.text();
};

export const getFileOrUri = async (source: string, logger: Logger): Promise<string> => {
  if (isUri(source)) {
    logger.debug('-Found uri file ' + source);
    return download(source, logger);
  }
  logger.debug('-Found local file ' + source);
  return readFileSync(source).toString('utf-8');
};
