import {IPropertyClass, IRenderResult} from "../interface/i-property-class";
import {renderMustache} from "../function/render-mustache";
import {UniqueArray} from "./unique-array";
import {splitByLineBreak} from "../function/split-by-line-break";
import {formatText} from "../function/formatText";


export class InterfaceProperty implements IPropertyClass {

    interfaceName: string;
    fileName: string;
    description: Array<string> = [];
    imports: UniqueArray<string> = new UniqueArray<string>();
    properties: { [name: string]: { data: IMustacheProperty, import?: string } } = {}
    //later put here an type
    additionalProperties: Array<{ type: string; isArray: boolean }> = [];

    constructor(public originalName: string) {
        this.convertName(originalName);
    }

    private convertName(originalName: string) {
        this.interfaceName = formatText(originalName, 'ANY', 'PascalCase');
        this.fileName = formatText(originalName, 'ANY', 'KebabCase');
    }

    addImports(_import: string) {
        this.imports.push(_import);
    }

    addAdditionalProperties(type: string, isArray: boolean = false) {
        this.additionalProperties.push({type, isArray});
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

        const renderProperties = Object.values(this.properties).map((prop) => {
            return {
                import: prop.import,
                name: prop.data.propertyName,
                render: renderMustache('property-class.mustache', prop.data)
            }
        }).sort((a, b) => a.name.localeCompare(b.name));

        renderProperties.filter(p => !!p.import).forEach(property => this.imports.push(property.import));

        const viewData: IMustacheInterface = {

            interfaceName: this.interfaceName,
            isImport: this.imports.get().length > 0,
            imports: this.imports.get().sort(),

            isDescription: (this.description || '').length > 0,
            description: this.description,


            isProperties: renderProperties.length > 0,
            properties: renderProperties.map(rf => splitByLineBreak(rf.render)),

            isAdditionalProperties: this.additionalProperties.length > 0,
            additionalProperties: this.additionalProperties
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

    isAdditionalProperties: boolean;
    additionalProperties: Array<{ type: string, isArray: boolean }>;

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
