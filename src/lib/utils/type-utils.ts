export const isArray = (d: unknown) => Array.isArray(d);
export const isObject = (d: unknown) => d?.constructor.name === 'Object';
export function isString(value: unknown) {
  return typeof value === 'string' || value instanceof String;
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}
