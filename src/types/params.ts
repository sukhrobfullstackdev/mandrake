import { Network } from 'magic-passport/types';

export interface ExtensionOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface DecodedQuery {
  API_KEY?: string;
  DOMAIN_ORIGIN?: string;
  ETH_NETWORK?: string | { rpcUrl: string; chainId?: number; chainType?: string };
  network?: Network;
  host?: string;
  sdk?: string;
  version?: string;
  ext?: ExtensionOptions;
  locale?: string;
  bundleId?: string;
  meta?: Record<string, string>;
}
