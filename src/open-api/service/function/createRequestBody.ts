import { IRequestBody } from '../../interface/open-api-mine/i-request-body';
import { IReference } from '../../interface/open-api-mine/i-reference';
import { IRefResult } from '../../classes/register';
import { ISchema } from '../../interface/open-api-mine/i-schema';
import { Configuration } from '../../classes/Configuration';
import { getPropertyFactory } from '../../component/schemas/property/getPropertyFactory';
import { renderPropertyClass } from '../../component/schemas/renderPropertyClass';
import { getNormalizedName } from '../../component/schemas/property/getNoramlizedName';

export const REQUEST_SCHEMA_PREFIX = '#/Request/schemas/';

export type CreateRequestBody = { [contentType: string]: IRefResult };

export const createRequestBody = (
  functionName: string,
  requestBodyOrRef: IRequestBody | IReference,
  folderPath: string,
  config: Configuration,
): CreateRequestBody => {
  const logger = config.getLogger();
  const folderManager = config.getFolderManager();
  const register = config.getReference();

  const response: CreateRequestBody = {};
  if (requestBodyOrRef) {
    if (requestBodyOrRef['$ref']) {
      console.log('request body $ref');
    } else if (!!requestBodyOrRef) {
      const requestBody = requestBodyOrRef as IRequestBody;
      const contentTypes = Object.keys(requestBody.content);
      for (const contentType of contentTypes) {
        const content = requestBody.content[contentType];
        const contentSchema = content?.schema as ISchema;
        if (contentSchema) {
          const reference = contentSchema.$ref;
          if (reference) {
            const importRef = register.getImportAndTypeByRef(reference, folderPath);
            if (importRef) {
              response[contentType] = importRef;
            }
          } else {
            const schemaName = getNormalizedName('INTERFACE', config, functionName, ['Request']);
            try {
              const classes = getPropertyFactory(
                {
                  schemaName,
                  schema: contentSchema,
                  prefixRefKey: REQUEST_SCHEMA_PREFIX,
                  folderPath: folderManager.getInterfaceRequestFolder(),
                  round: 0,
                },
                config,
              );
              const registered = classes.map((clazz) => {
                // render class
                renderPropertyClass(clazz, config);
                register.addReference(clazz.getReferenceKey(), {
                  className: clazz.getName(),
                  fileName: clazz.getFileName(),
                  folderPath: clazz.getFolderPath(),
                  schema: contentSchema,
                });
                return clazz.getReferenceKey();
              });
              if (registered.length > 0) {
                const importRef = register.getImportAndTypeByRef(registered[0], folderPath);
                if (importRef) {
                  response[contentType] = importRef;
                } else {
                  logger.warn('Request ref not found ' + registered[0]);
                }
              }
            } catch (e) {
              logger.warn(`Fatal error creating request component ${contentSchema} `);
              logger.warn('- schema', JSON.stringify(contentSchema, null, 2));
              logger.warn('- error', e);
            }
          }
        }
      }
    }
  }

  return response;
};
