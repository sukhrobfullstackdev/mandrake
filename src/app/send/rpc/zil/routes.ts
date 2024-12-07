import { ValidRoutesConfig } from '@app/send/rpc/routes';
import { ZilRpcMethods } from '@constants/multichain-rpc-methods';

export const zilRoutes: ValidRoutesConfig = {
  [ZilRpcMethods.ZIL_SENDTRANSACTION]: {
    module: 'zil',
  },
  [ZilRpcMethods.ZIL_DEPLOYCONTRACT]: {
    module: 'zil',
  },
  [ZilRpcMethods.ZIL_GETWALLET]: {
    module: 'zil',
  },
  [ZilRpcMethods.ZIL_CALLCONTRACT]: {
    module: 'zil',
  },
};
