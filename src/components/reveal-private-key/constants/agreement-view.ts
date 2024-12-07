import { RevealViewType, RevealViewTypeObj } from '@components/reveal-private-key/__type__';

export const ROUTE: RevealViewTypeObj = {
  [RevealViewType.EXPORT]: '/api-wallets/rpc/user/magic_export_key/export_private_key',
  [RevealViewType.REVEAL]: '/send/rpc/user/magic_reveal_key/reveal_private_key',
};
