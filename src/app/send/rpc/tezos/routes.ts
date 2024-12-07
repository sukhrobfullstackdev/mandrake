import { ValidRoutesConfig } from '@app/send/rpc/routes';
import { TezosRpcMethods } from '@constants/multichain-rpc-methods';

export const tezosRoutes: ValidRoutesConfig = {
  [TezosRpcMethods.TEZOS_GETACCOUNT]: {
    module: 'tezos',
  },
  [TezosRpcMethods.TEZOS_SENDCONTRACTINVOCATIONOPERATION]: {
    module: 'tezos',
  },
  [TezosRpcMethods.TEZOS_SENDCONTRACTORIGINATIONOPERATION]: {
    module: 'tezos',
  },
  [TezosRpcMethods.TEZOS_SENDCONTRACTPING]: {
    module: 'tezos',
  },
  [TezosRpcMethods.TEZOS_SENDDELEGATIONOPERATION]: {
    module: 'tezos',
  },
  [TezosRpcMethods.TEZOS_SENDTRANSACTION]: {
    module: 'tezos',
  },
};
