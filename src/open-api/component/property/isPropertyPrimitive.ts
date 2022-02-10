export type Primitive = 'boolean' | 'integer' | 'number' | 'string';

export const PrimitiveValues: Array<Primitive> = ['boolean', 'integer', 'number', 'string'];

export const isPropertyPrimitive = (type: string) => !!PrimitiveValues.find((t) => t === type);
