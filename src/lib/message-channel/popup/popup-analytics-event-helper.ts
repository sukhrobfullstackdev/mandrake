import { DEPLOY_ENV } from '@constants/env';
import { WalletType } from '@custom-types/wallet';
import { usePassportStore } from '@hooks/data/passport/store';
import { PopupAtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { BaseAnalyticsProperties } from '@lib/message-channel/event-helper';

export const getBasePassportAnalyticsProperties = (): BaseAnalyticsProperties => {
  /**
   *  parse the SDK version from the decoded query params passed in via the SDK
   *  https://magiclink.atlassian.net/browse/M2PB-363
   */
  const {
    apiKey = usePassportStore.getState().magicApiKey || '',
    sdkType = 'magic-passport',
    network,
    locale,
  } = usePassportStore.getState().decodedQueryParams;

  /**
   *  hydrate the userId in state if we have a valid accessToken
   *  we should do this higher up in the component tree like the container or something
   *  https://magiclink.atlassian.net/browse/M2PB-362
   */
  const userId = usePassportStore.getState().userId;

  if (!network || !network.name || !network.id) throw new Error('Network is not defined');

  const env = `${DEPLOY_ENV}${network.testnet ? '-testnet' : ''}`;

  return {
    uid: userId,
    sdk: sdkType,
    eventOrigin: PopupAtomicRpcPayloadService.getEventOrigin(),
    api_key: apiKey,
    source: 'mandrake-magic',
    locale,
    env,
    blockchain: network?.name,
    rpcUrl: network?.rpcUrls?.default?.http[0],
    chainId: network?.id.toString(),
    json_rpc_method: PopupAtomicRpcPayloadService.getActiveRpcPayload()?.method,
    walletType: WalletType.ETH,
  };
};
