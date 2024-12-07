// Add secret sauce to convert pk to something
export const createHashNative = async (string: string): Promise<string> => {
  // Create a new Hash object using the SHA-512 algorithm
  let encoder: null | TextEncoder = new TextEncoder();
  let data: null | Uint8Array = encoder.encode(string);
  encoder = null;

  // Use native crypto to avoid trust for third parties
  const hash = await crypto.subtle.digest('SHA-512', data);
  data = null;

  // Creates compressed string
  const view = new Uint8Array(hash);
  return String.fromCharCode.apply(null, [...view]);
};
