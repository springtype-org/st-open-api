import {IPropertyClass, IRenderResult} from "../interface/i-property-class";
import {renderMustache} from "../function/render-mustache";
import {formatText} from "../function/formatText";


export class PrimitiveTypeProperty implements IPropertyClass {

    typeName: string;
    fileName: string;
    primitiveType: string;

    constructor(originalName: string) {
        this.convertName(originalName);
    }

    convertName(originalName: string) {
        this.typeName = formatText(originalName, 'ANY', 'PascalCase');
        this.fileName = formatText(originalName, 'ANY', 'KebabCase');
    }

    setPrimitiveType(primitiveType: string) {
        this.primitiveType = primitiveType
        
    }

    render(): IRenderResult {
        const viewData: IMustachePrimitiveType = {
            typeName: this.typeName,
            primitiveType: this.primitiveType
        }
        return {
            classEnumName: this.typeName,
            fileName: this.fileName,
            render: renderMustache('primitive-type.mustache', viewData)
        }
    }
}

interface IMustachePrimitiveType {
    typeName: string;
    primitiveType: string;
}

