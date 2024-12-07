import { ValidRoutesConfig } from '@app/passport/rpc/routes';

export const WalletRoutes: ValidRoutesConfig = {
  magic_passport_wallet: { module: 'wallet' },
  magic_passport_wallet_nfts: { module: 'wallet' },
  send_user_operation: { module: 'wallet' },
};
