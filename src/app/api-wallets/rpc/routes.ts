import { userRoutes } from './user/routes';

type MagicApiWalletMethodRouteConfig = {
  /** The module an RPC route is scoped to */
  module: 'user';

  /** if this RPC route will go through a server component */
  isServerRoute?: boolean;
  /** Override the navigation path for an RPC method */
  pathOverride?: string;
};

export type MagicApiWalletValidRoutesConfig = { [key: string]: MagicApiWalletMethodRouteConfig };

export const magicApiWalletValidRoutes: MagicApiWalletValidRoutesConfig = {
  ...userRoutes,
};
