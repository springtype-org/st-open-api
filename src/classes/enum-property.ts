import {IPropertyClass, IRenderResult} from "../interface/i-property-class";
import {renderMustache} from "../function/render-mustache";
import {configuration} from "../function/config";
import {formatText} from "../function/formatText";


export class EnumProperty implements IPropertyClass {

    enumName: string;
    fileName: string;
    values: Array<{ isString: boolean, value: string }> = [];

    constructor(originalName: string) {
        this.convertName(originalName);
    }

    convertName(originalName: string) {
        this.enumName = formatText(originalName, 'ANY', 'PascalCase');
        this.fileName = formatText(originalName, 'ANY', 'KebabCase');
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
            values: this.values.sort((a, b) => a.value.localeCompare(b.value))
                .map(((value, index, arr) => ({
                    ...value,
                    last: index === arr.length - 1
                })))
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

