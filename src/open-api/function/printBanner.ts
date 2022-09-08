import { resolve } from 'path';
import { readFileSync } from 'fs';
import { getPackageInfo } from './getPackageInfo';

export const printBanner = () => {
  const banner = readFileSync(resolve(__dirname, '../banner.txt'), 'utf-8');
  console.log(banner);
  console.log();
};
