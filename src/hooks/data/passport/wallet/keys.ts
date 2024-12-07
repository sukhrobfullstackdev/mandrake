export type GetPassportEOAWalletParamsQueryKey = ReturnType<typeof passportWalletQueryKeys.get>;

export type GetPassportEOAWalletParams = {
  accessToken: string;
};

export const passportWalletQueryKeys = {
  base: ['passport-wallet'] as const,

  get: (params: GetPassportEOAWalletParams) => [[...passportWalletQueryKeys.base, 'get'], params] as const,
};

export type EOAWalletResponse = {
  publicAddress: string;
  walletId: string;
  id: string;
};
