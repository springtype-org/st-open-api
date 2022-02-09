import { appendFileSync } from 'fs';
import { join } from 'path';
import { ISchema } from '../interface/open-api-mine/i-schema';
import { IFunctionResponse } from '../classes/object-property';
import { getInterfaceOrEnumFromSchema } from './get-property';
import { configuration } from './config';
import { formatText } from '../common/function/text/formatText';
import { IRefResult } from '../classes/ref';

export const createResponseInterfaces = (
  operationId: string,
  responses: any,
  serviceFolder: string,
): IFunctionResponse & { import?: IRefResult } => {
  const reference = configuration.getReference();
  const folder = configuration.getFolderManager();

  const success = responses['200'] || responses['201'];

  // TODO: Refactor me !!!
  if (!!success && !!success.content) {
    const successContent = success.content;
    let isJson = false;
    let responseType;
    let _import;

    const isPlaintext = !!successContent['text/plain'];
    if (isPlaintext) {
      responseType = 'string';
    }
    const isDownload = !!successContent['application/octet-stream'];

    if (!isDownload && successContent['application/json']) {
      isJson = true;
      const responseSchema = success.content['application/json'].schema as ISchema;
      if (responseSchema.$ref) {
        const importAndType = reference.getImportAndTypeByRef(responseSchema.$ref, serviceFolder);
        responseType = importAndType.className;
        _import = importAndType;
      } else {
        const schemaName = `${operationId}Response`;
        const className = `I${formatText(schemaName, 'Any', 'PascalCase')}`;
        const interfaceOrEnumeration = getInterfaceOrEnumFromSchema(
          className,
          schemaName,
          responseSchema,
          folder.getInterfaceResponseFolder(),
        );

        if (interfaceOrEnumeration) {
          const rendered = interfaceOrEnumeration.render();
          appendFileSync(join(folder.getInterfaceResponseFolder(), `${rendered.fileName}.ts`), rendered.render);
          _import = interfaceOrEnumeration.fileName;
          const refKey = `#/components/schemas/response/${schemaName}`;
          reference.addReference(refKey, {
            fileName: interfaceOrEnumeration.fileName,
            className,
            folderPath: folder.getInterfaceResponseFolder(),
          });
          const importAndType = reference.getImportAndTypeByRef(refKey, serviceFolder);

          responseType = importAndType.className;
          importAndType.className;
          _import = importAndType;
        }
      }
    }
    return {
      responseClass: responseType,
      isJsonResponse: isJson,
      isPlaintextResponse: isPlaintext,
      isDownloadResponse: isDownload,
      import: _import,
    };
  }
  return {
    isJsonResponse: false,
    isPlaintextResponse: false,
    isDownloadResponse: false,
  };
};
