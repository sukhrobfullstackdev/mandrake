/**
 * Returns `true` if the given `source` is an email address, `false` otherwise.
 */
export function isValidEmail(source?: string | null) {
  if (!source) return false;

  const emailRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(source);
}

/**
 * Returns `true` if `value` is a valid URL string, `false` otherwise.
 */
export function isValidURL(value?: string | URL | null) {
  if (!value) return false;
  if (value instanceof URL) return true;

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * If `value` is a `string`, attempts to parse as JSON. If `value` is a plain
 * object, attempts to serialize as JSON, then parse. If parsing fails at any
 * step, returns `false`.
 */
export function isValidJSON(value: unknown) {
  try {
    if (value == null) return false;

    let result;
    if (typeof value === 'string' || value instanceof String) result = JSON.parse(value as string);
    else result = JSON.parse(JSON.stringify(value));

    if (result == null) return false;

    return true;
  } catch {
    return false;
  }
}
