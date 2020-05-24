import * as path from "path";
import * as Mustache from "mustache";
import * as fs from "fs";

const TYPE_TEMPLATE_DIR = path.join(process.argv[1], '..', 'template', 'mustache');

const cache: { [filePath: string]: string } = {}

export const renderMustache = (templateName: string, viewData: any) => {
    const templatePath = path.join(TYPE_TEMPLATE_DIR, templateName);
    let templateString;

    if (!!cache[templatePath]) {
        templateString = cache[templatePath]
    } else {
        templateString = fs.readFileSync(templatePath).toString('utf8')
        cache[templatePath] = templateString;
    }

    return Mustache.render(templateString, viewData);
}

