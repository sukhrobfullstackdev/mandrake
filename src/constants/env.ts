import { env } from 'next-runtime-env';
import { isServer } from '@utils/context';

export enum ENVType {
  Prod = 'prod',
  Dev = 'dev',
  Stagef = 'stagef',
  PreviewDeployments = 'preview-deployments',
  Local = 'local',
  Test = 'test',
}

export const DEPLOY_ENV = (env('NEXT_PUBLIC_DEPLOY_ENV') as ENVType) || ENVType.Prod;
export const IS_TEST_ENV = DEPLOY_ENV === ENVType.Test;
export const IS_LOCAL_ENV = isServer
  ? process.env.HOSTNAME === 'localhost'
  : window.location.origin.includes('localhost');

export const NODE_ENV = process.env.NODE_ENV || '';
export const APP_URL = env('NEXT_PUBLIC_APP_URL') || 'https://next.magic.link';
export const LEGACY_APP_URL = env('NEXT_PUBLIC_LEGACY_APP_URL') || 'https://legacy.magic.link';
export const BACKEND_URL = env('NEXT_PUBLIC_BACKEND_URL') || 'https://api.magic.link';
export const NFT_API_URL = env('NEXT_PUBLIC_NFT_API_URL') || '';
export const GAS_API_URL = env('NEXT_PUBLIC_GAS_API_URL') || 'https://gas-api.magic.link/';
export const API_WALLETS_URL = env('NEXT_PUBLIC_API_WALLETS_URL') || 'https://global-tee-sandbox.magickms.com/';
export const PASSPORT_API_URL = env('NEXT_PUBLIC_PASSPORT_API_URL') || 'https://api.identity.magiclabs.com';
export const PASSPORT_IDENTITY_API_URL =
  env('NEXT_PUBLIC_PASSPORT_IDENTITY_API_URL') || 'https://api.identity.magiclabs.com';
export const MAGIC_INDEXER_API_URL = env('NEXT_PUBLIC_INDEXER_API_URL') || 'https://api.indexer.stagef.magiclabs.com';
export const PASSPORT_OPS_API_URL = env('NEXT_PUBLIC_PASSPORT_OPS_API_URL') || 'https://api.ops.magiclabs.com';
export const NEWTON_EXCHANGE_API_URL = env('NEXT_PUBLIC_NEWTON_EXCHANGE_API_URL') || 'https://api.nex.magiclabs.com';
export const GET_CREDENTIALS_PROXY_URL = env('NEXT_PUBLIC_GET_CREDENTIALS_PROXY_URL') || 'https://gbscache.magic.link';
export const LEGACY_URL =
  IS_LOCAL_ENV && !IS_TEST_ENV ? 'http://localhost:3024' : env('NEXT_PUBLIC_LEGACY_URL') || 'https://auth.magic.link';
export const HIGHTOUCH_API_KEY =
  env('NEXT_PUBLIC_HIGHTOUCH_API_KEY') || 'bd4da5ad552bc66253c783216579db0ffcc3348a38b36fc3622bd4f35a4d2cd3';
export const HIGHTOUCH_API_HOST = env('NEXT_PUBLIC_HIGHTOUCH_API_HOST') || 'us-east-1.hightouch-events.com';
export const DATADOG_CLIENT_KEY = env('NEXT_PUBLIC_DATADOG_CLIENT_KEY') || 'pub8b293385bb535666adf9256e5495ac2c';
export const DATADOG_RUM_APP_KEY = env('NEXT_PUBLIC_DATADOG_RUM_APP_KEY') || '86e7b5a6-29d3-4e88-969e-d686edb0d82c';
export const DATADOG_RUM_CLIENT_KEY =
  env('NEXT_PUBLIC_DATADOG_RUM_CLIENT_KEY') || 'pub174dff0fc858b42978e99c5c6c9fe3df';
export const GOOGLE_SIGN_IN_CLIENT_ID = env('NEXT_PUBLIC_GOOGLE_SIGN_IN_CLIENT_ID') || '';
// this is the version of the code that is deployed to Vercel based on the commit SHA
export const GIT_COMMIT_SHA = env('NEXT_PUBLIC_GIT_COMMIT_SHA') || '';
export const ONRAMPER_API_KEY = env('NEXT_PUBLIC_ONRAMPER_API_KEY') || '';
export const ONRAMPER_URL = env('NEXT_PUBLIC_ONRAMPER_URL') || '';

export const MAGIC_WALLET_DAPP_API_KEY = 'pk_live_882646865C70D783';
export const MAGIC_WALLET_DAPP_REFERRER = 'https://wallet.magic.link';
export const MC_GOOGLE_OAUTH_CLIENT_ID = '832269600623-itf89vjp9bcl84dtuahuhl9rhdg3kmjh.apps.googleusercontent.com';
export const GOOGLE_RECAPTCHA_KEY = '6LeNFhYnAAAAAOdT8FTDslkbnybTudMivXQ8P6TU';
export const MC_FIAT_ON_RAMP_ONRAMPER_API_KEY_WALLET_HUB = 'pk_prod_01GTEYJ2ZB5SBRDH79FY843VHA';
export const MC_FIAT_ON_RAMP_ONRAMPER_API_KEY_DAPPS = 'pk_prod_01GXNN3PMY5GDYBTJYNY3VE63B';
export const SARDINE_URL_TEST = 'https://crypto.sandbox.sardine.ai';
export const SARDINE_URL_PROD = 'https://crypto.sardine.ai';
export const MAGIC_LOCAL_DASHBOARD = 'http://localhost:3015';
export const MAGIC_DEV_DASHBOARD = 'https://dashboard.dev.magic.link';
export const MAGIC_STAGEF_DASHBOARD = 'https://dashboard.stagef.magic.link';
export const MAGIC_DASHBOARD = 'https://dashboard.magic.link';
export const IS_PROD_ENV = DEPLOY_ENV === ENVType.Prod;
export const MGBOX_API_URL = 'https://box.magic.link';
export const REVEAL_MAGIC_URL = 'https://reveal.magic.link';
export const MAGIC_DASHBOARD_LIST = [
  MAGIC_LOCAL_DASHBOARD,
  MAGIC_DEV_DASHBOARD,
  MAGIC_STAGEF_DASHBOARD,
  MAGIC_DASHBOARD,
];
export const WILD_CARD = 'WILDCARD';
