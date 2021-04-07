import { isUri } from 'valid-url';
import { readFileSync } from 'fs';
import * as Ajv from 'ajv';
import { join } from 'path';
import { download } from './download';

import { createComponentInterfaces } from './create-component-interfaces';
import { copyResources } from './copy-resources';
import { createServiceClasses } from './create-service-classes';
import { transpileToJs } from './transpile-to-js';
import { createReactProvider } from './create-react-provider';
import { createStaticServices } from './create-static-services';
import { configuration } from './config';
import { initServiceReference } from './init-references';

const getSourceAsString = async (source: string): Promise<string> => {
  if (isUri(source)) {
    return download(source);
  }
  return readFileSync(source).toString('utf-8');
};

const validate = async (openApiSchema: object): Promise<boolean> => {
  const JSON_SCHEMA_3_0_x = JSON.parse(
    readFileSync(join(__dirname, '..', 'schema/open-api-3-0-x.json')).toString('utf-8'),
  );
  const ajv = Ajv({ schemaId: 'auto', allErrors: true });
  ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));
  const valid = ajv.validate(JSON_SCHEMA_3_0_x, openApiSchema);
  if (!valid && configuration.isDebug()) console.log(ajv.errors);
  return valid;
};

export const executeGenerationAction = async () => {
  const isDebug = configuration.isDebug();
  configuration.print();

  try {
    const openApi = JSON.parse(await getSourceAsString(configuration.getOpenApiFile()));
    const valid = await validate(openApi);

    if (isDebug) {
      console.log('OpenApi Json is valid :', valid);
    }
    if (valid || configuration.ignoreValidation()) {
      if (isDebug) {
        console.log('Initialize references');
      }

      createComponentInterfaces(openApi.components);

      if (!configuration.isComponentOnly()) {
        initServiceReference(configuration.getFolderManager());
        createServiceClasses(openApi);

        if (configuration.isCreateReactProvider()) {
          createReactProvider();
        }

        if (configuration.isCreateStaticServices()) {
          createStaticServices();
        }
        copyResources();
      }

      const language = configuration.getLanguage();
      if (language === 'js' || language === 'onlyJs') {
        transpileToJs();
      }
    } else {
      console.error('OpenApi Json not valid.');
      process.exit(1);
      return;
    }
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
};
