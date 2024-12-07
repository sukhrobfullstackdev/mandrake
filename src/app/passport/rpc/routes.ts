import { EthRoutes } from '@app/passport/rpc/eth/routes';
import { UserRoutes } from '@app/passport/rpc/user/routes';
import { WalletRoutes } from '@app/passport/rpc/wallet/routes';

type MagicMethodRouteConfig = {
  /** The module an RPC route is scoped to */
  module: 'user' | 'magic_chain' | 'eth' | 'wallet';

  /** if this RPC route will go through a server component */
  isServerRoute?: boolean;
  /** Override the navigation path for an RPC method */
  pathOverride?: string;
};

export type ValidRoutesConfig = { [key: string]: MagicMethodRouteConfig };

export const validRoutes: ValidRoutesConfig = {
  ...EthRoutes,
  ...UserRoutes,
  ...WalletRoutes,
};
