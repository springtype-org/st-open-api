export type Primitive = 'boolean' | 'integer' | 'number' | 'string';

export const PrimitiveValues: Array<Primitive> = ['boolean', 'integer', 'number', 'string'];

export const isPropertyPrimitive = (property: { type?: string; enum?: any; [additionalProps: string]: any }) =>
  !property?.enum && !!PrimitiveValues.find((t) => t === property?.type);
