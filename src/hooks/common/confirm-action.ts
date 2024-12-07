'use client';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useClientConfigFeatureFlags } from '@hooks/common/client-config';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import {
  ConfirmActionInfo,
  ConfirmActionType,
  useBeginConfirmActionQuery,
  useConfirmActionStatusPollerQuery,
} from '@hooks/data/embedded/confirm-action';
import { useStore } from '@hooks/store';
import { useIsMobileSDK, useIsRnOrIosSDK } from '@lib/utils/platform';
import { isHexString, toUtf8String } from 'ethers';
import { useEffect, useState } from 'react';

export enum ConfirmActionStatus {
  Approved = 'APPROVED',
  Expired = 'EXPIRED',
  Rejected = 'REJECTED',
  Pending = 'PENDING',
}

export const ConfirmActionErrorCodes = {
  USER_REJECTED_CONFIRMATION: 'USER_REJECTED_CONFIRMATION',
  CONFIRMATION_EXPIRED: 'CONFIRMATION_EXPIRED',
};

export function useConfirmActionStatusPoller({ confirmationId }: { confirmationId?: string }) {
  const [isActionConfirmed, setIsActionConfirmed] = useState(false);
  const [isActionConfirmationExpired, setIsActionConfirmationExpired] = useState(false);
  const { authUserId } = useStore(state => state);
  const expirationDuration = 60 * 1000; // 1 minute in milliseconds
  const startTime = Date.now();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();

  useEffect(() => {
    const checkExpiration = () => {
      if (Date.now() - startTime > expirationDuration) {
        setIsActionConfirmationExpired(true);
      }
    };

    const interval = setInterval(checkExpiration, 1000);
    return () => clearInterval(interval);
  }, [startTime, expirationDuration]);
  const { data: confirmActionState } = useConfirmActionStatusPollerQuery(
    { authUserId: authUserId || '', confirmationId: confirmationId || '' },
    {
      enabled: Boolean(authUserId) && Boolean(confirmationId) && !isActionConfirmed && !isActionConfirmationExpired,
      refetchInterval: 2000,
      refetchIntervalInBackground: true,
    },
  );

  useEffect(() => {
    if (confirmActionState?.status === ConfirmActionStatus.Approved) {
      setIsActionConfirmed(true);
    } else if (confirmActionState?.status === ConfirmActionStatus.Rejected) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserRejectedAction);
    }
  }, [confirmActionState?.status]);
  return { isActionConfirmed, isActionConfirmationExpired };
}

export function useConfirmAction() {
  const [confirmUrl, setConfirmUrl] = useState<string>('');
  const isRnOrIosSDK = useIsRnOrIosSDK();
  const isMobileSdk = useIsMobileSDK();
  const { authUserId, authUserSessionToken } = useStore(state => state);
  const { apiKey } = useStore(state => state.decodedQueryParams);
  const [confirmationId, setConfirmationId] = useState<string | undefined>(undefined);
  const features = useClientConfigFeatureFlags();
  const { mutateAsync: beginConfirmActionAsync } = useBeginConfirmActionQuery();
  const { isActionConfirmed, isActionConfirmationExpired } = useConfirmActionStatusPoller({ confirmationId });
  const [isSkipConfirmAction, setIsSkipConfirmAction] = useState(false);

  const doConfirmActionIfRequired = async ({
    action,
    payload,
  }: {
    action: ConfirmActionType;
    payload: ConfirmActionInfo;
  }) => {
    if (!features?.isTransactionConfirmationEnabled) {
      setIsSkipConfirmAction(true);
      return;
    }

    let confirmWindow;
    if (!isRnOrIosSDK)
      confirmWindow = window.open(
        `${window.location.origin}/confirm-action?ak=${apiKey}&authUserId=${authUserId}&authUserSessionToken=${authUserSessionToken}`,
      );
    const beginRes = await beginConfirmActionAsync({ authUserId: authUserId || '', action, payload });
    setConfirmationId(beginRes.confirmationId);
    const tct = beginRes.temporaryConfirmationToken;
    const curl = `${window.location.origin}/confirm-action?tct=${tct}&authUserId=${authUserId}&authUserSessionToken=${authUserSessionToken}${
      isMobileSdk ? '&open_in_device_browser=true' : ''
    }`;
    setConfirmUrl(curl);
    if (confirmWindow) confirmWindow.location = curl;
  };

  // Mobile: popup only works inside of a useEffect
  useEffect(() => {
    if (!confirmUrl || !isRnOrIosSDK) return;
    window.open(confirmUrl);
    setConfirmUrl('');
  }, [confirmUrl]);

  return {
    doConfirmActionIfRequired,
    isActionConfirmed,
    isActionConfirmationExpired,
    isSkipConfirmAction,
  };
}

export const formatMessageForConfirmTab = (m: string): string => {
  if (isHexString(m)) {
    try {
      return toUtf8String(m);
    } catch (e) {
      // If hex is from uint8array, the above will throw an error
      return m;
    }
  }
  return m;
};
