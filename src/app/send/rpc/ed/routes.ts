import { ValidRoutesConfig } from '@app/send/rpc/routes';
import { EdRpcMethods } from '@constants/multichain-rpc-methods';

export const edRoutes: ValidRoutesConfig = {
  [EdRpcMethods.ED_SIGN]: {
    module: 'ed',
  },
  [EdRpcMethods.ED_GETPUBLICKEY]: {
    module: 'ed',
  },
};
