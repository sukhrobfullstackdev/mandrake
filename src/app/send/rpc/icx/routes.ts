import { ValidRoutesConfig } from '@app/send/rpc/routes';
import { IcxRpcMethods } from '@constants/multichain-rpc-methods';

export const icxRoutes: ValidRoutesConfig = {
  [IcxRpcMethods.ICX_GETBALANCE]: {
    module: 'icx',
  },
  [IcxRpcMethods.ICX_SENDTRANSACTION]: {
    module: 'icx',
  },
  [IcxRpcMethods.ICX_GETACCOUNT]: {
    module: 'icx',
  },
  [IcxRpcMethods.ICX_SIGNTRANSACTION]: {
    module: 'icx',
  },
};
