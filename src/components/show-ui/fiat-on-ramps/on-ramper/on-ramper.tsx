'use client';

import { ONRAMPER_API_KEY, ONRAMPER_URL } from '@constants/env';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { WalletType } from '@custom-types/wallet';
import { useChainInfo } from '@hooks/common/chain-info';
import { useColorMode } from '@hooks/common/client-config';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useUserInfoQuery, userQueryKeys } from '@hooks/data/embedded/user';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { getWalletType } from '@lib/utils/network-name';
import { LoadingSpinner } from '@magiclabs/ui-components';
import { useSearchParams } from 'next/navigation';
import qs from 'qs';
import { useEffect } from 'react';

export default function OnRamper() {
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const { isComplete: isHydrateSessionComplete, isError: isHydrateSessionError } = useHydrateSession();
  const { authUserId, authUserSessionToken } = useStore(state => state);
  const { ethNetwork, ext, meta } = useStore(state => state.decodedQueryParams);
  const chainType = getWalletType(ethNetwork, ext); // 'ETH' if not multichain
  const { chainInfo } = useChainInfo();
  const searchParams = useSearchParams();
  const colorMode = useColorMode();
  const isDarkMode = colorMode === 'dark';

  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();

  useEffect(() => {
    if (!isHydrateSessionComplete) return;
    if (isHydrateSessionError) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserDeniedAccountAccess);
    }
  }, [isHydrateSessionComplete, isHydrateSessionError]);

  const { data: userInfoData } = useUserInfoQuery(
    userQueryKeys.info({
      authUserId: authUserId || '',
      authUserSessionToken: authUserSessionToken || '',
      walletType: WalletType.ETH,
    }),
    { enabled: !!authUserId && !!authUserSessionToken && isHydrateSessionComplete && !isHydrateSessionError },
  );

  useEffect(() => {
    IFrameMessageService.showOverlay();
  }, []);

  const srcUrl = ONRAMPER_URL;
  const onramperKey = meta?.onRamperApiKey || ONRAMPER_API_KEY;

  const parsedParams = qs.parse(qs.stringify(searchParams));

  const urlParams = [
    `apiKey=${onramperKey}`,
    'isAddressEditable=true',
    `defaultCrypto=${chainType === WalletType.ETH ? 'ETH' : 'FLOW'}`,
    `defaultAmount=${chainInfo?.name === 'Polygon' ? '30' : '100'}`,
    `defaultPaymentMethod=${parsedParams?.defaultPaymentMethod || 'creditcard'}`,
    `themeName=${isDarkMode ? 'dark' : 'light'}`,
    'isAmountEditable=true',
  ];

  if (activeRpcPayload?.params?.[0]?.onramperParams) {
    const { onramperParams } = activeRpcPayload.params[0];
    Object.entries(onramperParams).forEach(([key, value]) => {
      urlParams.push(`${key}=${value}`);
    });
  }

  return (
    <>
      {userInfoData ? (
        <iframe
          src={`${srcUrl}?${urlParams.join('&')}`}
          height="600px"
          width="400px"
          title="OnRamper"
          allow="accelerometer; autoplay; camera; gyroscope; payment"
        />
      ) : (
        <LoadingSpinner size={36} strokeWidth={4} />
      )}
    </>
  );
}
