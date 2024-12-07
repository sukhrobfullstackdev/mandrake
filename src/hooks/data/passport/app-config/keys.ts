export type MagicPassportConfigQueryKey = ReturnType<typeof magicPassportQueryKeys.passportConfig>;

export type PassportConfigParams = {
  magicApiKey: string;
};

export const magicPassportQueryKeys = {
  base: ['passport'] as const,
  passportConfig: (params: PassportConfigParams) => [[...magicPassportQueryKeys.base, 'config'], params] as const,
};
