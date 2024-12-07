import { ValidRoutesConfig } from '@app/send/rpc/routes';
import {
  ETH_SEND_GASLESS_TRANSACTION,
  ETH_REQUESTACCOUNTS,
  ETH_SENDTRANSACTION,
  ETH_SIGN,
  ETH_SIGNTRANSACTION,
  ETH_SIGNTYPEDDATA,
  ETH_SIGNTYPEDDATA_V3,
  ETH_SIGNTYPEDDATA_V4,
  PERSONAL_ECRECOVER,
  PERSONAL_SIGN,
} from '@constants/eth-rpc-methods';

export const ethRoutes: ValidRoutesConfig = {
  net_version: {
    module: 'eth',
  },
  eth_gasPrice: {
    module: 'eth',
  },
  eth_accounts: {
    module: 'eth',
  },
  eth_coinbase: {
    module: 'eth',
  },
  [ETH_SIGN]: {
    module: 'eth',
  },
  [PERSONAL_ECRECOVER]: {
    module: 'eth',
  },
  [PERSONAL_SIGN]: {
    module: 'eth',
  },
  [ETH_SIGNTYPEDDATA]: {
    module: 'eth',
  },
  [ETH_SIGNTYPEDDATA_V3]: {
    module: 'eth',
  },
  [ETH_SIGNTYPEDDATA_V4]: {
    module: 'eth',
  },
  [ETH_SENDTRANSACTION]: {
    module: 'eth',
  },
  [ETH_SIGNTRANSACTION]: {
    module: 'eth',
  },
  [ETH_REQUESTACCOUNTS]: {
    module: 'eth',
  },
  [ETH_SEND_GASLESS_TRANSACTION]: {
    module: 'eth',
  },
};
