import { ValidRoutesConfig } from '@app/send/rpc/routes';
import { HmyRpcMethods } from '@constants/multichain-rpc-methods';

export const hmyRoutes: ValidRoutesConfig = {
  [HmyRpcMethods.HMY_GETBALANCE]: {
    module: 'hmy',
  },
  [HmyRpcMethods.HMY_SENDTRANSACTION]: {
    module: 'hmy',
  },
};
