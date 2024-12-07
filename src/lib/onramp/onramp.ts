import { NODE_ENV } from '@constants/env';
import { WalletType } from '@custom-types/wallet';
import { isGlobalAppScope } from '@utils/connect-utils';
import { isOptimism } from '@utils/network';
import { getWalletType } from '@utils/network-name';

// Redirect to Stripe if MA wallet
export const shouldRouteToStripe = (isMainnet: boolean, hasOnRamperApiKey: boolean) => {
  const isProd = NODE_ENV === 'production';
  // Don't redirect if user is on testnet as on-ramps are disabled in prod
  if (!isMainnet && isProd) return false;
  // if a customer has KYB'd with OnRamper and they pass us their OnRamper API key, we should not redirect them to Stripe
  if (hasOnRamperApiKey) return false;
  return !isGlobalAppScope();
};

// Redirect to On Ramper for Flow, Optimism, and users located outside of USA
export const shouldRouteToOnRamper = (
  isMainnet: boolean,
  network: string | undefined,
  isFiatOnRampEnabled: boolean,
  isFiatOnRampSardineEnabled: boolean,
  isFiatOnRampStripeEnabled: boolean,
  hasOnRamperApiKey: boolean,
) => {
  // if a customer has KYB'd with OnRamper and they pass us their OnRamper API key, we should redirect to onramper
  if (hasOnRamperApiKey) return true;

  const isProd = NODE_ENV === 'production';
  // Route to on-ramp selection page if testnet && prod
  if (!isMainnet && isProd) {
    return false;
  }
  if (
    getWalletType(network) !== WalletType.ETH ||
    isOptimism(network) ||
    (!isFiatOnRampEnabled && !isFiatOnRampSardineEnabled && !isFiatOnRampStripeEnabled)
  ) {
    return true;
  }
  const isUSA = true;
  try {
    // todo: handle fetch location
    // const userLocation = await getUserLocation();
    // isUSA = userLocation?.data?.is_usa;
  } catch (e) {
    logger.error('Error with getUserLocation', e);
  }
  const routeToOnRamper = !isUSA;
  return routeToOnRamper;
};
