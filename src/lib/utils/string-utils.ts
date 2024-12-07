export const camelToSnakeCase = (str: string): string => {
  return str.replace(/[A-Z]/g, (char: string) => `_${char.toLowerCase()}`);
};

export const snakeToCamelCase = (str: string) => {
  return str.toLowerCase().replace(/(_\w)/g, (char: string) => char.toUpperCase().substring(1));
};

/**
 * Replace symbols and camel-case with spaces
 * @param str  The string to normalize
 * @returns  The normalized string
 */
export default function normalize(str: string): string {
  return str
    .replace(/([^a-zA-Z0-9]+|\s+)/g, ' ')
    .replace(/([A-Z][a-z])/g, ' $1')
    .replace(/([a-z](?=\d)|\d(?=[a-z]))/g, '$1 ')
    .replace(/\s\s+/g, ' ')
    .trim();
}

/**
 * Normalize and lowercase string
 * @param str  The string to lowercase
 * @returns  The lowercase string
 */
export function lowerCase(str: string): string {
  return normalize(str).toLowerCase();
}

/**
 * Normalize and uppercase string
 * @param str  The string to uppercase
 * @returns  The uppercase string
 */
export function upperCase(str: string): string {
  return normalize(str).toUpperCase();
}

/**
 * Capitalize the first letter of a string
 * @param str  The string to capitalize
 * @returns  The capitalized string
 */
export function capitalize(str: string): string {
  return `${str.charAt(0).toUpperCase()}${str.slice(1).toLowerCase()}`;
}

/**
 * Determine if a string should be preceded by 'a' or 'an'
 * @param str  The string to check
 * @returns  The indeterminate article if necessary
 */
export function getIndeterminateArticle(str: string): string {
  return ['a', 'e', 'i', 'o', 'u'].includes(str.charAt(0).toLowerCase()) ? 'an' : 'a';
}
