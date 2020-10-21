import {IPropertyClass, IRenderResult} from "../interface/i-property-class";
import {camelToKebabCase} from "../function/camel-to-kebab-case";
import {renderMustache} from "../function/render-mustache";
import {UniqueArray} from "./unique-array";
import {splitByLineBreak} from "../function/split-by-line-break";
import {convertClassName} from "../function/convert-class-name";
import {sortBy} from "../function/sortBy";
import {sort} from "../function/sort";


export class InterfaceProperty implements IPropertyClass {

    interfaceName: string;
    fileName: string;
    description: Array<string> = [];
    imports: UniqueArray<string> = new UniqueArray<string>();
    properties: { [name: string]: { data: IMustacheProperty, import?: string } } = {}

    constructor(public originalName: string) {
        this.convertName(originalName);
    }

    private convertName(originalName: string) {
        let interfaceName = convertClassName(originalName);
        this.interfaceName = interfaceName;
        this.fileName = camelToKebabCase(interfaceName);
    }

    addImports(_import: string) {
        this.imports.push(_import);
    }

    addProperty(prop: IProperty) {
        const data: IMustacheProperty = {
            isDescription: !!prop.description,
            description: splitByLineBreak(prop.description),
            required: prop.required,
            value: prop.value,
            propertyName: prop.propertyName,
            isArray: prop.isArray,
        }
        this.properties[data.propertyName] = {data: data, import: prop.import};
    }

    render(): IRenderResult {
        const renderProperties = sortBy(Object.entries(this.properties), '0').map(e => e[1]).map((prop) => {
            return {import: prop.import, render: renderMustache('property-class.mustache', prop.data)}
        });

        renderProperties.forEach(property => this.imports.push(property.import));

        const viewData: IMustacheInterface = {

            interfaceName: this.interfaceName,
            isImport: this.imports.get().length > 0,
            imports: sort(this.imports.get()),

            isDescription: (this.description || '').length > 0,
            description: this.description,


            isProperties: renderProperties.length > 0,
            properties: renderProperties.map(rf => splitByLineBreak(rf.render))
        }
        return {
            classEnumName: this.interfaceName,
            fileName: this.fileName,
            render: renderMustache('interface.mustache', viewData)
        }
    }
}

interface IMustacheInterface {
    interfaceName: string;

    isImport: boolean;
    imports?: Array<string>;

    isDescription: boolean;
    description?: Array<string>;

    isProperties: boolean;
    properties: Array<Array<string>>;

}

interface IMustacheProperty {
    propertyName: string;

    isDescription: boolean;
    description?: Array<string>;

    required: boolean;
    isArray: boolean;
    value: string;
}

export interface IProperty {
    propertyName: string;
    import: string;
    description?: string;
    required: boolean;
    isArray: boolean;
    value: string;
}
