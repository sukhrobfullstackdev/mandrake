import { ValidRoutesConfig } from '@app/send/rpc/routes';

export const walletRoutes: ValidRoutesConfig = {
  mc_login: { module: 'wallet' },
  mc_wallet: { module: 'wallet', pathOverride: 'magic_wallet' },
  magic_wallet: { module: 'wallet' },
  magic_show_send_tokens_ui: { module: 'wallet' },
  magic_show_fiat_onramp: { module: 'wallet' },
  magic_show_address: { module: 'wallet' },
  magic_show_nfts: { module: 'wallet' },
  magic_show_balances: { module: 'wallet' },
  mc_disconnect: { module: 'wallet' },
};
