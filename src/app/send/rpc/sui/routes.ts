import { ValidRoutesConfig } from '@app/send/rpc/routes';
import { SuiRpcMethods } from '@constants/multichain-rpc-methods';

export const suiRoutes: ValidRoutesConfig = {
  [SuiRpcMethods.SUI_SIGNANDSENDTRANSACTION]: {
    module: 'sui',
  },
};
