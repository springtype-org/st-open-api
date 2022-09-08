import { MainContext } from './pipeline';
import Ajv from 'ajv';
import { readFileSync } from 'fs';
import { join } from 'path';
import OPEN_API_SCHEMA from 'ajv/lib/refs/json-schema-draft-04.json';
import { AbstractAction } from '../pipeline/AbstractAction';

const JSON_SCHEMA_3_0_X = JSON.parse(
  readFileSync(join(__dirname, '..', '..', 'schema/open-api-3-0-x.json')).toString('utf-8'),
);

export class ValidateParsedSourceAction extends AbstractAction<MainContext> {
  getName() {
    return ValidateParsedSourceAction.name;
  }

  async run(context: MainContext): Promise<void> {
    const ajv = Ajv({ schemaId: 'auto', allErrors: true });
    ajv.addMetaSchema(OPEN_API_SCHEMA);
    const valid = ajv.validate(JSON_SCHEMA_3_0_X, context.openApi.parsed);

    context.validate = { valid: !!valid };

    if (!valid) {
      context.validate.errors = ajv.errors;
      context.logger.warn('valiation errors', ajv.errors);
      if (!context.config.ignoreValidation()) {
        throw new Error('Invalid open-api' + ajv.errors);
      }
    }
  }
}
