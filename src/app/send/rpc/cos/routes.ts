import { ValidRoutesConfig } from '@app/send/rpc/routes';
import { CosRpcMethods } from '@constants/multichain-rpc-methods';

export const cosmosRoutes: ValidRoutesConfig = {
  [CosRpcMethods.COS_SIGN]: {
    module: 'cos',
  },
  [CosRpcMethods.COS_SENDTOKENS]: {
    module: 'cos',
  },
  [CosRpcMethods.COS_SIGNANDBROADCAST]: {
    module: 'cos',
  },
  [CosRpcMethods.COS_CHANGEADDRESS]: {
    module: 'cos',
  },
  [CosRpcMethods.COS_SIGNTYPEDDATA]: {
    module: 'cos',
  },
};
