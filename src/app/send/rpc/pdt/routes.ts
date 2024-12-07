import { ValidRoutesConfig } from '@app/send/rpc/routes';
import { PdtRpcMethods } from '@constants/multichain-rpc-methods';

export const pdtRoutes: ValidRoutesConfig = {
  [PdtRpcMethods.PDT_CONTRACTCALL]: {
    module: 'pdt',
  },
  [PdtRpcMethods.PDT_GETACCOUNT]: {
    module: 'pdt',
  },
  [PdtRpcMethods.PDT_GETBALANCE]: {
    module: 'pdt',
  },
  [PdtRpcMethods.PDT_SENDTRANSACTION]: {
    module: 'pdt',
  },
  [PdtRpcMethods.PDT_SIGNPAYLOAD]: {
    module: 'pdt',
  },
  [PdtRpcMethods.PDT_SIGNRAW]: {
    module: 'pdt',
  },
};
