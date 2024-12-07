import { ValidRoutesConfig } from '@app/send/rpc/routes';
import { NearRpcMethods } from '@constants/multichain-rpc-methods';

export const nearRoutes: ValidRoutesConfig = {
  [NearRpcMethods.NEAR_SIGNTRANSACTION]: {
    module: 'near',
  },
  [NearRpcMethods.NEAR_GETPUBLICKEY]: {
    module: 'near',
  },
};
