import { algodRoutes } from '@app/send/rpc/algod/routes';
import { aptosRoutes } from '@app/send/rpc/aptos/routes';
import { avaRoutes } from '@app/send/rpc/ava/routes';
import { bespokeRoutes } from '@app/send/rpc/bespoke/routes';
import { btcRoutes } from '@app/send/rpc/btc/routes';
import { cfxRoutes } from '@app/send/rpc/cfx/routes';
import { cosmosRoutes } from '@app/send/rpc/cos/routes';
import { edRoutes } from '@app/send/rpc/ed/routes';
import { ethRoutes } from '@app/send/rpc/eth/routes';
import { farcasterRoutes } from '@app/send/rpc/farcaster/routes';
import { flowRoutes } from '@app/send/rpc/flow/routes';
import { gdkmsRoutes } from '@app/send/rpc/gdkms/routes';
import { hederaRoutes } from '@app/send/rpc/hedera/routes';
import { hmyRoutes } from '@app/send/rpc/hmy/routes';
import { icxRoutes } from '@app/send/rpc/icx/routes';
import { kdaRoutes } from '@app/send/rpc/kda/routes';
import { nearRoutes } from '@app/send/rpc/near/routes';
import { oauthRoutes } from '@app/send/rpc/oauth/routes';
import { pdtRoutes } from '@app/send/rpc/pdt/routes';
import { solRoutes } from '@app/send/rpc/sol/routes';
import { suiRoutes } from '@app/send/rpc/sui/routes';
import { taquitoRoutes } from '@app/send/rpc/taquito/routes';
import { terraRoutes } from '@app/send/rpc/terra/routes';
import { tezosRoutes } from '@app/send/rpc/tezos/routes';
import { zilRoutes } from '@app/send/rpc/zil/routes';
import { authRoutes } from './auth/routes';
import { nftRoutes } from './nft/routes';
import { userRoutes } from './user/routes';
import { walletRoutes } from './wallet/routes';

type MagicMethodRouteConfig = {
  /** The module an RPC route is scoped to */
  module:
    | 'auth'
    | 'user'
    | 'nft'
    | 'wallet'
    | 'oauth'
    | 'gdkms'
    | 'eth'
    | 'sol'
    | 'sui'
    | 'btc'
    | 'cfx'
    | 'hmy'
    | 'algod'
    | 'ava'
    | 'near'
    | 'zil'
    | 'taquito'
    | 'terra'
    | 'ed'
    | 'flow'
    | 'aptos'
    | 'icx'
    | 'pdt'
    | 'hedera'
    | 'tezos'
    | 'cos'
    | 'bespoke'
    | 'farcaster'
    | 'kda';
  /** if this RPC route will go through a server component */
  isServerRoute?: boolean;
  /** Override the navigation path for an RPC method */
  pathOverride?: string;
};

export type ValidRoutesConfig = { [key: string]: MagicMethodRouteConfig };

export const validRoutes: ValidRoutesConfig = {
  ...authRoutes,
  ...userRoutes,
  ...nftRoutes,
  ...walletRoutes,
  ...oauthRoutes,
  ...gdkmsRoutes,
  ...ethRoutes,
  ...solRoutes,
  ...btcRoutes,
  ...cosmosRoutes,
  ...aptosRoutes,
  ...suiRoutes,
  ...cfxRoutes,
  ...hmyRoutes,
  ...avaRoutes,
  ...nearRoutes,
  ...terraRoutes,
  ...edRoutes,
  ...icxRoutes,
  ...algodRoutes,
  ...zilRoutes,
  ...pdtRoutes,
  ...hederaRoutes,
  ...tezosRoutes,
  ...flowRoutes,
  ...taquitoRoutes,
  ...bespokeRoutes,
  ...farcasterRoutes,
  ...kdaRoutes,
};
