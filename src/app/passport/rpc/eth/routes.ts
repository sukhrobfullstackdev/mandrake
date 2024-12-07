import { ValidRoutesConfig } from '@app/passport/rpc/routes';

export const EthRoutes: ValidRoutesConfig = {
  eth_sendTransaction: { module: 'eth' },
  eth_sendUserOperation: { module: 'eth' },
  personal_sign: { module: 'eth' },
};
