import {IPropertyClass, IRenderResult} from "../interface/i-property-class";
import {camelToKebabCase} from "../function/camel-to-kebab-case";
import {renderMustache} from "../function/render-mustache";
import {convertClassName} from "../function/convert-class-name";
import {configuration} from "../function/config";
import {sortBy} from "../function/sortBy";


export class EnumProperty implements IPropertyClass {

    enumName: string;
    fileName: string;
    values: Array<{ isString: boolean, value: string }> = [];

    constructor(originalName: string) {
        this.convertName(originalName);
    }

    convertName(originalName: string) {
        let enumName = convertClassName(originalName);
        this.enumName = enumName
        this.fileName = camelToKebabCase(enumName);
    }

    setValues(values: Array<number | string>) {
        this.values = values.map(value => {
            return {
                isString: typeof value === 'string',
                value: value.toString()
            }
        })
    }

    render(): IRenderResult {
        const viewData: IMustacheEnum = {
            enumName: this.enumName,
            values: sortBy(this.values, 'value').map(((value, index, arr) => ({...value, last: index === arr.length - 1})))
        }
        return {
            classEnumName: this.enumName,
            fileName: this.fileName,
            render: renderMustache(`${configuration.isType() ? 'type' : 'enum'}.mustache`, viewData)
        }
    }
}

interface IMustacheEnum {
    enumName: string;
    values: Array<{ isString: boolean, value: string, last: boolean }>;
}

