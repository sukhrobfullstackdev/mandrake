import { ValidRoutesConfig } from '@app/send/rpc/routes';
import { CfxRpcMethods } from '@constants/multichain-rpc-methods';

export const cfxRoutes: ValidRoutesConfig = {
  [CfxRpcMethods.CFX_SENDTRANSACTION]: {
    module: 'cfx',
  },
};
