import { ValidRoutesConfig } from '@app/send/rpc/routes';
import { KdaRpcMethods } from '@constants/multichain-rpc-methods';

export const kdaRoutes: ValidRoutesConfig = {
  [KdaRpcMethods.KDA_SIGNTRANSACTION]: {
    module: 'kda',
  },
  [KdaRpcMethods.KDA_LOGINWITHSPIREKEY]: {
    module: 'kda',
  },
  [KdaRpcMethods.KDA_GETINFO]: {
    module: 'kda',
  },
};
