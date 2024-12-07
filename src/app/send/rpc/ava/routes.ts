import { ValidRoutesConfig } from '@app/send/rpc/routes';
import { AvaRpcMethods } from '@constants/multichain-rpc-methods';

export const avaRoutes: ValidRoutesConfig = {
  [AvaRpcMethods.AVA_GETACCOUNT]: {
    module: 'ava',
  },
  [AvaRpcMethods.AVA_SIGNTRANSACTION]: {
    module: 'ava',
  },
};
