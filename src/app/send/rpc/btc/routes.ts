import { ValidRoutesConfig } from '@app/send/rpc/routes';
import { BtcRpcMethods } from '@constants/multichain-rpc-methods';

export const btcRoutes: ValidRoutesConfig = {
  [BtcRpcMethods.BTC_SIGNTRANSACTION]: {
    module: 'btc',
  },
};
