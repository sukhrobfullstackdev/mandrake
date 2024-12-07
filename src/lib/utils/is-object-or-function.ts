export default function isObjectOrFunction(value: unknown): boolean {
  return value != null && (typeof value === 'object' || typeof value === 'function');
}
