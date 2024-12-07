import { ValidRoutesConfig } from '@app/send/rpc/routes';
import { AlgodRpcMethods } from '@constants/multichain-rpc-methods';

export const algodRoutes: ValidRoutesConfig = {
  [AlgodRpcMethods.ALGOD_GETACCOUNT]: {
    module: 'algod',
  },
  [AlgodRpcMethods.ALGOD_SIGNBID]: {
    module: 'algod',
  },
  [AlgodRpcMethods.ALGOD_SIGNGROUPTRANSACTION]: {
    module: 'algod',
  },
  [AlgodRpcMethods.ALGOD_SIGNGROUPTRANSACTIONV2]: {
    module: 'algod',
  },
  [AlgodRpcMethods.ALGOD_SIGNTRANSACTION]: {
    module: 'algod',
  },
};
