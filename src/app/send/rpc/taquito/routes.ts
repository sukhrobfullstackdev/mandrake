import { ValidRoutesConfig } from '@app/send/rpc/routes';
import { TaquitoRpcMethods } from '@constants/multichain-rpc-methods';

export const taquitoRoutes: ValidRoutesConfig = {
  [TaquitoRpcMethods.TAQUITO_SIGN]: {
    module: 'taquito',
  },
  [TaquitoRpcMethods.TAQUITO_GETPUBLICKEYANDHASH]: {
    module: 'taquito',
  },
};
