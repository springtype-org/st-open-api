import {ISchema} from "../interface/open-api-mine/i-schema";
import {IProperty} from "../classes/object-property";
import {EnumProperty} from "../classes/enum-property";
import * as fs from "fs";
import * as nodePath from "path";
import {join} from "path";

import {InterfaceProperty} from "../classes/interface-property";
import {mkdir} from "../classes/folder-manager";
import {configuration} from "./config";
import {InterfaceArrayProperty} from "../classes/interface-array-property";
import {formatText} from "./formatText";

export const getInterfaceOrEnumFromSchema = (className: string, originalName: string, schema: ISchema, path: string): InterfaceProperty | EnumProperty | InterfaceArrayProperty => {
    const isDebug = configuration.isDebug();
    if (isDebug) {
        console.log(`Get enum or interface ${className}`)
        console.log(`Schema ${className}`, JSON.stringify(schema, null, 2))
    }
    let isArray = false;
    if (schema.type === 'array') {
        isArray = true;
        if(!!schema.items && schema.items["$ref"]){
           const ref = configuration.getReference().getImportAndTypeByRef( schema.items["$ref"], path);
            return new InterfaceArrayProperty(className, ref.import,ref.className)
        }
        schema = schema.items;
        schema.type = 'object';
    }
    if (schema.type === 'object' || schema.properties || schema.additionalProperties) {
        if (isDebug) {
            console.log(`Object Schema ${className} (array=${isArray})`, JSON.stringify(schema, null, 2))
        }

        if (!!schema.properties || typeof schema.additionalProperties === 'object') {
            const interfaceProperty = new InterfaceProperty(className);
            for (const propertyName of Object.keys(schema.properties || {})) {
                const property = schema.properties[propertyName];
                const isRequired = (schema.required || []).indexOf(propertyName) > -1;
                interfaceProperty.addProperty(getProperty(className, originalName, propertyName, isRequired, property, path))
            }
            if(typeof schema.additionalProperties === 'object' && !!schema.additionalProperties.type){
               const isArray = schema.additionalProperties.type === 'array'
                if(isArray) {
                    interfaceProperty.addAdditionalProperties(mapType(schema.additionalProperties.items.type), true);
                }else {
                    interfaceProperty.addAdditionalProperties(mapType(schema.additionalProperties.type));
                }
            }
            return interfaceProperty;
        }
        //getReference(schema);

    } else if (schema.enum) {
        const enumClass = new EnumProperty(className);
        enumClass.setValues(schema.enum);
        return enumClass;
    } else {
        console.log(className, originalName, 'no mapping for schema found')
    }
}


const getProperty = (className: string, originalName: string, propertyName: string, required: boolean, schema: ISchema, path: string): IProperty => {
    const isDebug = configuration.isDebug();
    const ref = configuration.getReference();
    if (isDebug) {
        console.log(`Enter get property ${originalName}`, JSON.stringify(schema, null, 2))
    }
    if (schema.allOf) {
        schema = schema.allOf.find(v => !!v['$ref']) as any
    }
    let isArray = false;


    if (schema.type === 'array') {
        isArray = true;
        schema = schema.items;

        if (isPrimitive(schema.type)) {
            return {
                propertyName: propertyName,
                required: (schema.required || []).indexOf(propertyName) > -1 || required,
                description: '',
                isArray: isArray,
                value: mapType(schema.type),
                import: ''
            }
        } else {
            schema.type = 'object';
        }
    }
    let _import;
    let value = mapType(schema.type);

    const enumeration = getEnumeration(schema);

    if (isDebug && !!enumeration) {
        console.log('Enumeration found ', enumeration)
    }
    let reference = getReference(schema);

    if (isDebug && !!reference) {
        console.log('Reference found ', JSON.stringify(schema, null, 2))
    }

    if (!!enumeration) {
        let newOriginal = `${propertyName}${originalName.substring(0, 1).toUpperCase()}${originalName.substring(1)}`;
        const nestedPath = getNestedPath(path, 'enumeration');

        const enumeration = getInterfaceOrEnumFromSchema(`I${formatText(newOriginal, 'ANY', 'PascalCase')}`, newOriginal, schema, nestedPath) as EnumProperty;
        const rendered = enumeration.render();
        fs.appendFileSync(nodePath.join(nestedPath, `${rendered.fileName}.ts`), rendered.render)

        const refKey = `#/nested/enumeration/${newOriginal}`
        ref.addReference(refKey, {
            fileName: rendered.fileName,
            className: rendered.classEnumName,
            folderPath: nestedPath
        })
        reference = refKey;
    }

    if (schema.type === 'object' && !reference) {
        let newOriginal = `${propertyName}${originalName.substring(0, 1).toUpperCase()}${originalName.substring(1)}`;
        const nestedPath = getNestedPath(path, 'interface');

        const object = getInterfaceOrEnumFromSchema(`I${formatText(newOriginal, 'ANY', 'PascalCase')}`, newOriginal, schema, nestedPath) as EnumProperty;
        const rendered = object.render();
        fs.appendFileSync(nodePath.join(nestedPath, `${rendered.fileName}.ts`), rendered.render)

        const refKey = `#/nested/interface/${newOriginal}`
        ref.addReference(refKey, {
            fileName: rendered.fileName,
            className: rendered.classEnumName,
            folderPath: nestedPath
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

const getNestedPath = (path: string, type: string) => {
    return mkdir(join(path, type));
}

const isPrimitive = (type: string) => {
    switch (type) {
        case "boolean":
        case "integer":
        case "number":
        case  "string":
            return true;
    }
    return false

}
