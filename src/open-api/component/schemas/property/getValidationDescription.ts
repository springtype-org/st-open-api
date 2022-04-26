import { addPrefix } from '../../../common/function/text/addPrefix';
import { joinString } from '../../../common/function/text/joinString';
const join = joinString('');

export const getValidationDescription = (
  pattern: string,
  minimum: number,
  maximum: number,
  minLength: number,
  maxLength: number,
  exclusiveMinimum: boolean,
  exclusiveMaximum: boolean,
) => {
  return addPrefix('open-api validation:')(
    join(
      addPrefix('\n  - pattern: ')(pattern),
      addPrefix('\n  - minimum: ')(minimum),
      addPrefix('\n  - maximum: ')(maximum),
      addPrefix('\n  - minLength: ')(minLength),
      addPrefix('\n  - maxLength: ')(maxLength),
      addPrefix('\n  - exclusiveMinimum: ')(exclusiveMinimum),
      addPrefix('\n  - exclusiveMaximum: ')(exclusiveMaximum),
    ),
  );
};
