import { getDescriptionJoin } from './getDescriptionJoin';
import { getFormatPrefix } from './getFormatPrefix';
import { getValidationDescription } from './getValidationDescription';
import { ISchema } from '../../../interface/open-api-mine/i-schema';

export const getPropertyDescription = (property: ISchema) =>
  getDescriptionJoin(
    property.description,
    getFormatPrefix(property.format),
    getValidationDescription(
      property.pattern,
      property.minimum,
      property.maximum,
      property.minLength,
      property.maxLength,
      property.exclusiveMinimum,
      property.exclusiveMaximum,
    ),
  );
