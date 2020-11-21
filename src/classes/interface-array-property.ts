import {IPropertyClass, IRenderResult} from "../interface/i-property-class";
import {renderMustache} from "../function/render-mustache";
import {UniqueArray} from "./unique-array";
import {formatText} from "../function/formatText";


export class InterfaceArrayProperty implements IPropertyClass {

    interfaceName: string;
    fileName: string;
    description: Array<string> = [];
    imports: UniqueArray<string> = new UniqueArray<string>();

    constructor(public originalName: string, _import: string, public refClassName: string) {
        this.convertName(originalName);
        this.imports.push(_import);
    }

    private convertName(originalName: string) {
        this.interfaceName = formatText(originalName, 'ANY', 'PascalCase');
        this.fileName = formatText(originalName, 'ANY', 'KebabCase');
    }


    render(): IRenderResult {

        const viewData: IMustacheInterfaceArray = {

            interfaceName: this.interfaceName,
            refClassName: this.refClassName,
            isImport: this.imports.get().length > 0,

            imports: this.imports.get().sort(),
            isDescription: (this.description || '').length > 0,
            description: this.description,
        }
        return {
            classEnumName: this.interfaceName,
            fileName: this.fileName,
            render: renderMustache('interface-array.mustache', viewData)
        }
    }
}

interface IMustacheInterfaceArray {
    interfaceName: string;
    refClassName: string;
    isImport: boolean;
    imports: Array<string>;

    isDescription: boolean;
    description: Array<string>

}
