'use client';

import MCLoginHeader from '@app/send/rpc/wallet/mc_login/__components__/header';
import LoginFormPage from '@app/send/rpc/wallet/mc_login/connect-with-ui-login';
import { getQueryClient } from '@common/query-client';
import PageFooter from '@components/show-ui/footer';
import { WalletType } from '@custom-types/wallet';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { userQueryKeys, useUserInfoQuery } from '@hooks/data/embedded/user';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { Page } from '@magiclabs/ui-components';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import Web3Service from '@utils/web3-services/web3-service';
import { useEffect, useState } from 'react';

export default function RequestAccounts() {
  // We need to introduce caching here specifically for the public address otherwise imx will run into latency issues
  // Eth accounts does not itself need to create the wallets.
  // Because it will throw an error if not logged in, we can safely let the auth methods will create the wallet.
  //    Therefore assume that the wallet is created here.

  // [Caching]: disable the session hydration hook if auth user id and user session is already popupated in Zustand.
  // This way we can avoid unnecessary calls of verifyUserSessionMutation which will always result in a network call.
  const queryClient = getQueryClient();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  useEffect(() => AtomicRpcPayloadService.handleVersionSkew(), []);

  const { authUserId, authUserSessionToken } = useStore(state => state);
  const { isComplete: isHydrateSessionComplete, isError: isHydrateSessionError } = useHydrateSession({
    enabled: !authUserId || !authUserSessionToken,
  });

  const resolveActiveRpcRequest = useResolveActiveRpcRequest();
  const [hasResolvedOrRejected, setHasResolvedOrRejected] = useState(false);
  const [shouldDisplayLoginModal, setShouldDisplayLoginModal] = useState(false);

  const { data: userInfoData, error: userInfoError } = useUserInfoQuery(
    userQueryKeys.info({
      authUserId: authUserId || '',
      authUserSessionToken: authUserSessionToken || '',
      walletType: WalletType.ETH,
    }),
    {
      enabled: !!authUserId && !!authUserSessionToken,
    },
  );

  // Hydrate or reject.
  useEffect(() => {
    if (hasResolvedOrRejected || !activeRpcPayload) return;
    if ((isHydrateSessionComplete && isHydrateSessionError) || userInfoError) {
      setHasResolvedOrRejected(true);
      setShouldDisplayLoginModal(true);
      IFrameMessageService.showOverlay();
    }
  }, [activeRpcPayload, hasResolvedOrRejected, isHydrateSessionComplete, isHydrateSessionError, userInfoError]);

  useEffect(() => {
    if (hasResolvedOrRejected || !activeRpcPayload) return;
    if (userInfoData) {
      Web3Service.toChecksumAddress(userInfoData.publicAddress).then(checkSumAddr => {
        resolveActiveRpcRequest([checkSumAddr]);
        setHasResolvedOrRejected(true);
      });
      setHasResolvedOrRejected(true);
    }
  }, [activeRpcPayload, hasResolvedOrRejected, userInfoData]);

  return (
    <>
      <HydrationBoundary state={dehydrate(queryClient)}>
        {shouldDisplayLoginModal && (
          <Page backgroundType="blurred">
            <MCLoginHeader />
            <LoginFormPage />
            <PageFooter />
          </Page>
        )}
      </HydrationBoundary>
    </>
  );
}
