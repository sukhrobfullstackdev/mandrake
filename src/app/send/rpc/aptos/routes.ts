import { ValidRoutesConfig } from '@app/send/rpc/routes';
import { AptosRpcMethods } from '@constants/multichain-rpc-methods';

export const aptosRoutes: ValidRoutesConfig = {
  [AptosRpcMethods.APTOS_GETACCOUNT]: {
    module: 'aptos',
  },
  [AptosRpcMethods.APTOS_GETACCOUNTINFO]: {
    module: 'aptos',
  },
  [AptosRpcMethods.APTOS_SIGNANDSUBMITBCSTRANSACTION]: {
    module: 'aptos',
  },
  [AptosRpcMethods.APTOS_SIGNANDSUBMITTRANSACTION]: {
    module: 'aptos',
  },
  [AptosRpcMethods.APTOS_SIGNMESSAGE]: {
    module: 'aptos',
  },
  [AptosRpcMethods.APTOS_SIGNMESSAGEANDVERIFY]: {
    module: 'aptos',
  },
  [AptosRpcMethods.APTOS_SIGNTRANSACTION]: {
    module: 'aptos',
  },
};
