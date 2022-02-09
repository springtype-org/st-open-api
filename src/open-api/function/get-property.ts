/* eslint-disable no-console */
import * as fs from 'fs';
import * as nodePath from 'path';
import { join } from 'path';
import { ISchema } from '../interface/open-api-mine/i-schema';
import { IProperty } from '../classes/object-property';
import { EnumProperty } from '../classes/enum-property';

import { InterfaceProperty } from '../classes/interface-property';
import { mkdir } from '../classes/folder-manager';
import { configuration } from './config';
import { InterfaceArrayProperty } from '../classes/interface-array-property';
import { formatText } from '../common/function/text/formatText';
import { IRefResult } from '../classes/ref';

export const getInterfaceOrEnumFromSchema = (
  className: string,
  originalName: string,
  schema: ISchema,
  path: string,
  isRequestBody = false,
): InterfaceProperty | EnumProperty | InterfaceArrayProperty => {
  const isDebug = configuration.isDebug();
  if (isDebug) {
    console.log(`Get enum or interface ${className}`);
    console.log(`Schema ${className}`, JSON.stringify(schema, null, 2));
  }
  let isArray = false;
  if (schema.type === 'array') {
    isArray = true;
    if (!!schema.items && schema.items.$ref) {
      const ref = configuration.getReference().getImportAndTypeByRef(schema.items.$ref, path);
      return new InterfaceArrayProperty(className, ref, ref.className);
    }
    schema = schema.items;
    schema.type = 'object';
  }
  if (schema.type === 'object' || schema.properties || schema.additionalProperties) {
    if (isDebug) {
      console.log(`Object Schema ${className} (array=${isArray})`, JSON.stringify(schema, null, 2));
    }

    const interfaceProperty = new InterfaceProperty(className);
    if (!!schema.properties || typeof schema.additionalProperties === 'object') {
      for (const propertyName of Object.keys(schema.properties || {})) {
        const property = schema.properties[propertyName];
        const isRequired = (schema.required || []).indexOf(propertyName) > -1;
        interfaceProperty.addProperty(
          getProperty(className, originalName, propertyName, isRequired, property, path, isRequestBody),
        );
      }
      if (typeof schema.additionalProperties === 'object' && !!schema.additionalProperties.type) {
        const internalIsArray = schema.additionalProperties.type === 'array';
        if (internalIsArray) {
          interfaceProperty.addAdditionalProperties(schema.additionalProperties.items.type, true);
        } else {
          interfaceProperty.addAdditionalProperties(schema.additionalProperties.type);
        }
      }
      if (typeof schema.additionalProperties === 'object' && !!schema.additionalProperties.$ref) {
        const additionalPropertiesImport = configuration
          .getReference()
          .getImportAndTypeByRef(schema.additionalProperties.$ref, path);
        interfaceProperty.addImports(additionalPropertiesImport);
        interfaceProperty.addAdditionalProperties(additionalPropertiesImport.className);
      }
    } else if (schema.type === 'object') {
      // only object in as type
      interfaceProperty.addAdditionalProperties('any', false);
    }
    return interfaceProperty;
  }

  if (schema.enum) {
    const enumClass = new EnumProperty(className);
    enumClass.setValues(schema.enum);
    return enumClass;
  }
  console.log(className, originalName, 'no mapping for schema found');
};

const getProperty = (
  className: string,
  originalName: string,
  propertyName: string,
  required: boolean,
  schema: ISchema,
  path: string,
  isRequestBody: boolean,
): IProperty => {
  const isDebug = configuration.isDebug();
  const ref = configuration.getReference();
  if (isDebug) {
    console.log(`Enter get property ${originalName}`, JSON.stringify(schema, null, 2));
  }
  if (schema.allOf) {
    schema = schema.allOf.find((v) => !!v.$ref) as any;
  }
  let isArray = false;

  if (schema.type === 'array') {
    isArray = true;
    schema = schema.items;

    if (isPrimitive(schema.type)) {
      return {
        propertyName,
        required: (schema.required || []).indexOf(propertyName) > -1 || required,
        description: '',
        isArray,
        value: mapType(schema.type, isRequestBody, schema.format),
      };
    }
    schema.type = 'object';
  }

  let newImport!: IRefResult;

  let value = mapType(schema.type, isRequestBody, schema.format);

  const enumeration = getEnumeration(schema);

  if (isDebug && !!enumeration) {
    console.log('Enumeration found ', enumeration);
  }
  let reference = getReference(schema);

  if (isDebug && !!reference) {
    console.log('Reference found ', JSON.stringify(schema, null, 2));
  }

  if (enumeration) {
    const newOriginal = `${propertyName}${originalName.substring(0, 1).toUpperCase()}${originalName.substring(1)}`;
    const nestedPath = getNestedPath(path, 'enumeration');

    const enumeration = getInterfaceOrEnumFromSchema(
      `I${formatText(newOriginal, 'Any', 'PascalCase')}`,
      newOriginal,
      schema,
      nestedPath,
    ) as EnumProperty;
    const rendered = enumeration.render();
    fs.appendFileSync(nodePath.join(nestedPath, `${rendered.fileName}.ts`), rendered.render);

    const refKey = `#/nested/enumeration/${newOriginal}`;
    ref.addReference(refKey, {
      fileName: rendered.fileName,
      className: rendered.classEnumName,
      folderPath: nestedPath,
    });
    reference = refKey;
  }

  if (schema.type === 'object' && !reference) {
    const newOriginal = `${propertyName}${originalName.substring(0, 1).toUpperCase()}${originalName.substring(1)}`;
    const nestedPath = getNestedPath(path, 'interface');

    const object = getInterfaceOrEnumFromSchema(
      `I${formatText(newOriginal, 'Any', 'PascalCase')}`,
      newOriginal,
      schema,
      nestedPath,
    ) as EnumProperty;

    const rendered = object.render();
    fs.appendFileSync(nodePath.join(nestedPath, `${rendered.fileName}.ts`), rendered.render);

    const refKey = `#/nested/interface/${newOriginal}`;
    ref.addReference(refKey, {
      fileName: rendered.fileName,
      className: rendered.classEnumName,
      folderPath: nestedPath,
    });
    reference = refKey;
  }
  if (reference) {
    const refResult = ref.getImportAndTypeByRef(reference, path);
    newImport = refResult;
    value = refResult.className;
  }

  return {
    propertyName,
    required: (schema.required || []).indexOf(propertyName) > -1 || required,
    description: '',
    isArray,
    value,
    import: newImport,
  };
};
const getEnumeration = (schema: ISchema) => {
  if (schema.items && schema.items.enum) {
    return schema.items.enum;
  }
  if (schema.enum) {
    return schema.enum;
  }
};

const getReference = (schema: ISchema) => {
  if (schema.items && schema.items.$ref) {
    return schema.items.$ref;
  }
  if (schema.$ref) {
    return schema.$ref;
  }
};

const mapType = (type: string, isBody: boolean, format?: string) => {
  if (type === 'integer') {
    return 'number';
  }
  if (type === 'string' && isBody && format === 'binary') {
    return 'File';
  }
  return type;
};

const getNestedPath = (path: string, type: string) => mkdir(join(path, type));

const isPrimitive = (type: string) => {
  switch (type) {
    case 'boolean':
    case 'integer':
    case 'number':
    case 'string':
      return true;
    default:
      return false;
  }
};
