export type WalletInfoQueryKey = ReturnType<typeof walletQueryKeys.info>;
export type WalletSyncQueryKey = ReturnType<typeof walletQueryKeys.sync>;

export type WalletInfoParams = {
  authUserId: string;
  walletType: string;
  authUserSessionToken: string;
};

export type WalletSyncParams = {
  auth_user_id: string;
  public_address: string;
  wallet_type: string;
  encrypted_private_address?: string;
  encrypted_magic_private_address_share?: string;
  encrypted_client_private_address_share?: string;
  encrypted_seed_phrase?: string;
  encrypted_magic_seed_phrase_share?: string;
  encrypted_client_seed_phrase_share?: string;
  hd_path?: string;
  client_share_metadata?: object;
};

export const walletQueryKeys = {
  base: ['wallet'] as const,
  info: (params: WalletInfoParams) => [[...walletQueryKeys.base, 'info'], params] as const,
  sync: (params: WalletSyncParams) => [[...walletQueryKeys.base, 'sync'], params] as const,
};
