import * as path from 'path';
import * as Mustache from 'mustache';
import * as fs from 'fs';

const TYPE_TEMPLATE_DIR = path.join(__dirname, '..', 'template', 'mustache', 'ts');

const cache: { [filePath: string]: string } = {};

export const renderMustacheBuilder = (templateFolder: string) => (templateName: string, viewData: any) => {
  const templatePath = path.join(templateFolder, templateName);
  let templateString;

  if (cache[templatePath]) {
    templateString = cache[templatePath];
  } else {
    templateString = fs.readFileSync(templatePath).toString('utf8');
    cache[templatePath] = templateString;
  }
  return Mustache.render(templateString, viewData);
};

export const renderMustache = renderMustacheBuilder(TYPE_TEMPLATE_DIR);
