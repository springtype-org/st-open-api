import {ISchema} from "../interface/open-api-mine/i-schema";
import {IProperty, ObjectProperty} from "../classes/object-property";
import {EnumProperty} from "../classes/enum-property";
import * as fs from "fs";
import * as nodePath from "path";
import {IGenerateConfig} from "../interface/i-generate-config";

export const getObjectOrEnumFromSchema = (config: IGenerateConfig, className: string, originalName: string, schema: ISchema, path: string): ObjectProperty | EnumProperty | undefined => {
    if (schema.type === 'object') {
        const objectProperty = new ObjectProperty(className, config.useSpringtype);
        for (const propertyName of Object.keys(schema.properties)) {
            const property = schema.properties[propertyName];
            const isRequired = (schema.required || []).indexOf(propertyName) > -1;
            objectProperty.addProperty(getProperty(config, className, originalName, propertyName, isRequired, property, path))
        }
        return objectProperty;
    } else {
        const enumeration = schema.enum;
        if (enumeration) {
            const enumClass = new EnumProperty(className);
            enumClass.setValues(schema.enum);
            return enumClass;
        }

    }
}


const getProperty = (config: IGenerateConfig, className: string, originalName: string, propertyName: string, required: boolean, schema: ISchema, path: string): IProperty => {
    const {ref, folder} = config;
    const type = mapType(schema.type);
    const isArray = type === 'array';
    let value = isArray ? schema.items.type : type;
    let _import;

    const enumeration = getEnumeration(schema);
    let reference = getReference(schema);

    if (!!enumeration) {
        let newOriginal = `${originalName.substring(0, 1).toUpperCase()}${originalName.substring(1)}`;
        if (!newOriginal.toUpperCase().endsWith('enum')) {
            newOriginal += 'Enum';
        }
        const enumeration = getObjectOrEnumFromSchema(config, `I${newOriginal}`, newOriginal, schema, folder.getEnumerationFolder()) as EnumProperty;
        const rendered = enumeration.render();
        fs.appendFileSync(nodePath.join(folder.getEnumerationFolder(), `${rendered.fileName}.ts`), rendered.render)
        const refKey = `#/nested/enumeration/${newOriginal}`
        ref.addReference(refKey, {
            fileName: rendered.fileName,
            className: rendered.classEnumName,
            folderPath: folder.getEnumerationFolder()
        })
        reference = refKey;
    }
    if (!!reference) {
        const refResult = ref.getImportAndTypeByRef(reference, path);
        _import = refResult.import;
        value = refResult.className;
    }

    return {
        propertyName: propertyName,
        required: (schema.required || []).indexOf(propertyName) > -1 || required,
        description: '',
        isArray: isArray,
        value: value,
        import: _import,
    }
}
const getEnumeration = (schema: ISchema) => {
    if (schema.items && schema.items.enum) {
        return schema.items.enum;
    }
    if (schema.enum) {
        return schema.enum;
    }
}

const getReference = (schema: ISchema) => {
    if (schema.items && schema.items.$ref) {
        return schema.items.$ref;
    }
    if (schema.$ref) {
        return schema.$ref
    }
}

const mapType = (type: string) => {
    return type === 'integer' ? 'number' : type;
}