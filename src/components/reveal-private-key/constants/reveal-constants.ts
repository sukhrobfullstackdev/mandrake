import { RevealViewType, RevealViewTypeObj } from '@components/reveal-private-key/__type__';

export const LEGACY_FLOW_ROUTE: RevealViewTypeObj = {
  [RevealViewType.EXPORT]: '',
  [RevealViewType.REVEAL]: '/send/rpc/auth/magic_auth_logout',
};

export const MWS_FLOW_ROUTE: RevealViewTypeObj = {
  [RevealViewType.EXPORT]: '',
  [RevealViewType.REVEAL]: '/send/rpc/user/magic_reveal_key/mws_logout',
};
