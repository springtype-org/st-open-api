import {IPropertyClass, IRenderResult} from "../interface/i-property-class";
import {camelToKebabCase} from "../function/camel-to-kebab-case";
import {renderMustache} from "../function/render-mustache";
import {convertClassName} from "../function/convert-class-name";
import {configuration} from "../function/config";
import {sortBy} from "../function/sortBy";
import {UniqueArray} from "./unique-array";
import {splitByLineBreak} from "../function/split-by-line-break";
import {sort} from "../function/sort";
import {IProperty} from "./interface-property";


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
        let interfaceName = convertClassName(originalName);
        this.interfaceName = interfaceName;
        this.fileName = camelToKebabCase(interfaceName);
    }


    render(): IRenderResult {

        const viewData: IMustacheInterfaceArray = {

            interfaceName: this.interfaceName,
            refClassName: this.refClassName,
            isImport: this.imports.get().length > 0,

            imports: sort(this.imports.get()),
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
    isImport:  boolean;
    imports: Array<string>;

    isDescription: boolean;
    description: Array<string>

}
