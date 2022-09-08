import { ISchema } from '../../interface/open-api-mine/i-schema';
import { getPropertyFactory } from '../../component/schemas/property/getPropertyFactory';
import { IRefResult } from '../../classes/register';
import { IResponses } from '../../interface/open-api-mine/i-responses';
import { renderPropertyClass } from '../../component/schemas/renderPropertyClass';
import { getNormalizedName } from '../../component/schemas/property/getNoramlizedName';
import { Configuration } from '../../classes/Configuration';

export const RESPONSE_SCHEMA_PREFIX = '#/Response/schemas/';

export type CreateResponse = { [contentType: string]: IRefResult };

export const createResponse = (
  functionName: string,
  requestBodyOrRef: IResponses,
  folderPath: string,
  config: Configuration,
): CreateResponse => {
  const logger = config.getLogger();
  const folderManager = config.getFolderManager();
  const register = config.getReference();

  const response: CreateResponse = {};
  if (requestBodyOrRef) {
    const responseSchema = requestBodyOrRef[200] || requestBodyOrRef[201];
    if (responseSchema) {
      if (responseSchema['$ref']) {
        console.log('response $ref');
      } else if (!!responseSchema) {
        const rawResponse = responseSchema;
        if (rawResponse.content) {
          const contentTypes = Object.keys(rawResponse.content);
          for (const contentType of contentTypes) {
            const content = rawResponse.content[contentType];
            const contentSchema = content?.schema as ISchema;
            if (contentSchema) {
              const reference = contentSchema.$ref;
              if (reference) {
                const importRef = register.getImportAndTypeByRef(reference, folderPath);
                if (importRef) {
                  response[contentType] = importRef;
                }
              } else {
                const schemaName = getNormalizedName('INTERFACE', config, functionName, ['Response']);
                try {
                  const classes = getPropertyFactory(
                    {
                      schemaName,
                      schema: contentSchema,
                      prefixRefKey: RESPONSE_SCHEMA_PREFIX,
                      folderPath: folderManager.getInterfaceResponseFolder(),
                      round: 0,
                    },
                    config,
                  );
                  classes.forEach((propertyClass) => renderPropertyClass(propertyClass, config));
                  const registered = classes.map((clazz) => {
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
                      logger.warn('Response ref not found ' + registered[0]);
                    }
                  }
                } catch (e) {
                  logger.warn(`Fatal error creating response component ${contentSchema} `);
                  logger.warn('- schema', JSON.stringify(contentSchema, null, 2));
                  logger.warn('- error', e);
                }
              }
            }
          }
        }
      }
    }
  }
  return response;
};
