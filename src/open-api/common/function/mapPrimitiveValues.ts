import { Primitive } from '../../component/property/isPropertyPrimitive';

export const mapPrimitiveValues = (primitive: Primitive, format: string | undefined) => {
  const primitiveMap: Record<Primitive, () => string> = {
    integer: () => 'number',
    number: () => 'number',
    boolean: () => 'boolean',
    string: () => {
      // TODO: more mappings
      if (format === 'date') {
        // TODO: mapping ecmascript setter and getter
        // return 'Date';
      }
      return 'string';
    },
  };

  return primitiveMap[primitive]();
};
