export const PASSPORT_ERROR_URL = (code: string) => `/passport/error${code ? `?code=${code}` : ''}`;
