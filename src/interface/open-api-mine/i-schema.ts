import {IType} from "./i-type";

export interface ISchema {
    type: IType | 'object' | 'array';
    items?: ISchemaItem;
    required?: Array<string>;
    properties?: { [name: string]: ISchema };
    additionalProperties?:any;
    '$ref'?: string;
    enum?: Array<string | number>;
    allOf?: Array<{ '$ref': string } | any>
}

export interface ISchemaItem {
    type: 'string' | 'integer';
    enum?: Array<string | number>;
    '$ref': string;
}
