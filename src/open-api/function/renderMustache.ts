import { join } from 'path';
import { render as mustacheRender } from 'mustache';
import { readFileSync } from 'fs';

const TYPE_TEMPLATE_DIR = join(__dirname, '..', 'template', 'mustache', 'ts');

const cache: { [filePath: string]: string } = {};

export const renderMustacheBuilder = (templateFolder: string) => (templateName: string, viewData: any) => {
  const templatePath = join(templateFolder, templateName);
  let templateString;

  if (cache[templatePath]) {
    templateString = cache[templatePath];
  } else {
    templateString = readFileSync(templatePath).toString('utf8');
    cache[templatePath] = templateString;
  }
  return mustacheRender(templateString, viewData);
};

export const renderMustache = renderMustacheBuilder(TYPE_TEMPLATE_DIR);
