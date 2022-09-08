import { readFileSync } from 'fs';
import { join } from 'path';

export interface PackageJSON {
  name: string;
  version: string;
  description: string;
}

export const getPackageInfo = (): PackageJSON =>
  JSON.parse(readFileSync(join(__dirname, '..', 'package.json')).toString('utf-8'));
