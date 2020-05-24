import {IPropertyClass, IRenderResult} from "../interface/i-property-class";
import {camelToKebabCase} from "../function/camel-to-kebab-case";
import {renderMustache} from "../function/render-mustache";


export class EnumProperty implements IPropertyClass {

    enumName: string;
    fileName: string;
    values: Array<{isString: boolean, value: string}> = [];

    constructor(originalName: string) {
        this.convertName(originalName);
    }

    convertName(originalName: string) {
        let enumName = originalName;
        this.enumName = enumName
        this.fileName = camelToKebabCase(enumName);
    }

    setValues(values: Array<number| string>) {
        this.values = values.map( value => {
            return {
                isString: typeof value === 'string',
                value: value.toString()
            }
        })
    }

    render(): IRenderResult {
        const viewData: IMustacheEnum = {
            enumName: this.enumName,
            isValues: this.values.length > 0,
            values: this.values
        }
        return {
            classEnumName: this.enumName,
            fileName: this.fileName,
            render: renderMustache('enum.mustache', viewData)
        }
    }
}

interface IMustacheEnum {
    enumName: string;
    isValues: boolean;
    values: Array<{isString: boolean, value: string}>;
}

