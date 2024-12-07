import { ValidRoutesConfig } from '@app/send/rpc/routes';
import { SolRpcMethods } from '@constants/multichain-rpc-methods';

export const solRoutes: ValidRoutesConfig = {
  [SolRpcMethods.SOL_SIGNMESSAGE]: {
    module: 'sol',
  },
  [SolRpcMethods.SOL_SIGNTRANSACTION]: {
    module: 'sol',
  },
  [SolRpcMethods.SOL_SENDTRANSACTION]: {
    module: 'sol',
  },
  [SolRpcMethods.SOL_PARTIALSIGNTRANSACTION]: {
    module: 'sol',
  },
};
