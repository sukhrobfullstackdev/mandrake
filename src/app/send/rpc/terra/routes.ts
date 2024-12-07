import { ValidRoutesConfig } from '@app/send/rpc/routes';
import { TerraRpcMethods } from '@constants/multichain-rpc-methods';

export const terraRoutes: ValidRoutesConfig = {
  [TerraRpcMethods.TERRA_SIGN]: {
    module: 'terra',
  },
  [TerraRpcMethods.TERRA_GETPUBLICKEY]: {
    module: 'terra',
  },
};
