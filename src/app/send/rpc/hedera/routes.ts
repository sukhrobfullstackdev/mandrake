import { ValidRoutesConfig } from '@app/send/rpc/routes';
import { HederaRpcMethods } from '@constants/multichain-rpc-methods';

export const hederaRoutes: ValidRoutesConfig = {
  [HederaRpcMethods.HEDERA_SIGN]: {
    module: 'hedera',
  },
  [HederaRpcMethods.HEDERA_GETPUBLICKEY]: {
    module: 'hedera',
  },
};
