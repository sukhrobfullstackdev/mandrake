import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { DeviceVerificationStatus } from '@custom-types/new-device-verification';
import { useDeviceVerificationRedirect } from '@hooks/common/device-verification-redirect';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useDeviceVerificationStatusPollerQuery } from '@hooks/data/embedded/device-verification';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { DeviceVerificationEventOnReceived } from '@magic-sdk/types';
import { useEffect, useState } from 'react';

type UseDeviceVerificationPollerParams = {
  enabled?: boolean;
  verifyLink: string;
};

export const useDeviceVerificationPoller = ({ verifyLink }: UseDeviceVerificationPollerParams) => {
  const [isDeviceVerified, setIsDeviceVerified] = useState(false);
  const [isDeviceLinkExpired, setIsDeviceLinkExpired] = useState(false);
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const { redirectBackToAuthFlow } = useDeviceVerificationRedirect();

  // Define the expiration duration and start time
  const expirationDuration = 20 * 60 * 1000; // 20 minutes in milliseconds
  const startTime = Date.now();

  if (Date.now() - startTime > expirationDuration) {
    setIsDeviceLinkExpired(true);
  }

  const { data: deviceVerificationState } = useDeviceVerificationStatusPollerQuery(
    { verifyLink },
    {
      enabled: !!verifyLink && !isDeviceVerified && !isDeviceLinkExpired,
      refetchInterval: 2000, // Poll every 2 seconds
      refetchIntervalInBackground: true, // Continue polling in the background
    },
  );

  useEffect(() => {
    if (deviceVerificationState?.status === DeviceVerificationStatus.Approved) {
      setIsDeviceVerified(true);
      redirectBackToAuthFlow();
      AtomicRpcPayloadService.emitJsonRpcEventResponse(DeviceVerificationEventOnReceived.DeviceApproved);
    } else if (deviceVerificationState?.status === DeviceVerificationStatus.Rejected) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserDeniedAccountAccess);
    }
  }, [deviceVerificationState?.status]);

  return {
    isDeviceLinkExpired,
    isDeviceVerified,
  };
};
