import { appendFileSync } from 'fs';
import { join } from 'path';
import { ISchema } from '../interface/open-api-mine/i-schema';
import { IFunctionRequestBody } from '../classes/object-property';
import { getInterfaceOrEnumFromSchema } from './get-property';
import { configuration } from './config';
import { formatText } from '../common/function/text/formatText';
import { IRefResult } from '../classes/ref';

export const createRequestBodyInterfaces = (
  operationId: string,
  requestBody: any,
  serviceFolder: string,
): IFunctionRequestBody & { import?: IRefResult } => {
  const reference = configuration.getReference();
  const folder = configuration.getFolderManager();
  if (requestBody) {
    const { content } = requestBody;
    let responseType = 'string';
    let isJson = false;
    let isUpload = false;
    let refImport: IRefResult;
    if (content['application/json'] || content['multipart/form-data']) {
      isJson = !!content['application/json'];
      isUpload = !!content['multipart/form-data'];
      const newRequestBody = content['application/json'] || content['multipart/form-data'];
      const jsonRequestBody = newRequestBody.schema as ISchema;
      if (jsonRequestBody.$ref) {
        const importAndType = reference.getImportAndTypeByRef(jsonRequestBody.$ref, serviceFolder);
        responseType = importAndType.className;
        refImport = importAndType;
      } else {
        // TODO: refactor me
        const schemaName = `${operationId}Request`;
        const className = formatText(['I', schemaName], 'Any', 'PascalCase');
        const interfaceOrEnumeration = getInterfaceOrEnumFromSchema(
          className,
          schemaName,
          jsonRequestBody,
          folder.getInterfaceRequestFolder(),
          true,
        );

        if (interfaceOrEnumeration) {
          const rendered = interfaceOrEnumeration.render();
          appendFileSync(join(folder.getInterfaceRequestFolder(), `${rendered.fileName}.ts`), rendered.render);

          const refKey = `#/components/schemas/response/${schemaName}`;
          reference.addReference(refKey, {
            fileName: interfaceOrEnumeration.fileName,
            className,
            folderPath: folder.getInterfaceRequestFolder(),
          });
          const importAndType = reference.getImportAndTypeByRef(refKey, serviceFolder);

          responseType = importAndType.className;
          refImport = importAndType;
        }
      }
      return {
        isRequestBodyJson: isJson,
        isRequestBodyUpload: isUpload,
        import: refImport,
        requestBodyClass: responseType,
      };
    }
  }
  return {
    isRequestBodyJson: false,
    isRequestBodyUpload: false,
  };
};
