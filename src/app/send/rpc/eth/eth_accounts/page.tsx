'use client';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { WalletType } from '@custom-types/wallet';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useUserInfoQuery, userQueryKeys } from '@hooks/data/embedded/user';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { isSdkVersionGreaterOrEqual } from '@lib/semver';
import Web3Service from '@utils/web3-services/web3-service';
import { useEffect, useState } from 'react';

export default function Page() {
  // We need to introduce caching here specifically for the public address otherwise imx will run into latency issues
  // Eth accounts does not itself need to create the wallets.
  // Because it will throw an error if not logged in, we can safely let the auth methods will create the wallet.
  //    Therefore assume that the wallet is created here.

  // [Caching]: disable the session hydration hook if auth user id and user session is already popupated in Zustand.
  // This way we can avoid unnecessary calls of verifyUserSessionMutation which will always result in a network call.
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  useEffect(() => AtomicRpcPayloadService.handleVersionSkew(), []);

  const { authUserId, authUserSessionToken } = useStore(state => state);
  const { isComplete: isHydrateSessionComplete, isError: isHydrateSessionError } = useHydrateSession({
    enabled: !authUserId || !authUserSessionToken,
  });

  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();
  const [hasResolvedOrRejected, setHasResolvedOrRejected] = useState(false);

  const { version: sdkVersion } = useStore(state => state.decodedQueryParams);

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
      if (isSdkVersionGreaterOrEqual('17.0.0', sdkVersion)) {
        logger.log('eth_accounts resolved with an empty array');
        resolveActiveRpcRequest([]);
      } else {
        rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserDeniedAccountAccess);
      }
      setHasResolvedOrRejected(true);
    }
  }, [activeRpcPayload, hasResolvedOrRejected, isHydrateSessionComplete, isHydrateSessionError]);

  useEffect(() => {
    if (hasResolvedOrRejected || !activeRpcPayload) return;
    if (userInfoData) {
      Web3Service.toChecksumAddress(userInfoData.publicAddress).then(checkSumAddr => {
        if (!checkSumAddr) {
          rejectActiveRpcRequest(
            RpcErrorCode.InternalError,
            `eth_accounts failed to generate checksum address with publicAddress: ${userInfoData.publicAddress}`,
          );
          setHasResolvedOrRejected(true);
          return;
        }
        resolveActiveRpcRequest([checkSumAddr]);
        setHasResolvedOrRejected(true);
      });
      setHasResolvedOrRejected(true);
    }
  }, [activeRpcPayload, hasResolvedOrRejected, userInfoData]);

  return null;
}
