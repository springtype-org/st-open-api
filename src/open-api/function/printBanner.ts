import { resolve } from 'path';
import { readFileSync } from 'fs';
import { getPackageInfo } from './get-package-info';

export const printBanner = () => {
  const info = getPackageInfo();
  const banner = resolve(__dirname, '../banner.txt');
  console.log(readFileSync(banner, 'utf-8'));
  console.log(`--- Version: ${info.version}`);
  console.log();
};
