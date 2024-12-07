'use client';

import { useLoginContext } from '@app/send/login-context';
import { useDeviceVerificationPoller } from '@hooks/common/device-verification';
import { useDeviceVerificationRedirect } from '@hooks/common/device-verification-redirect';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { DeviceVerificationEventEmit, DeviceVerificationEventOnReceived } from '@magic-sdk/types';
import { useEffect, useState } from 'react';
import DeviceVerificationExpired from './device-verification-expired';
import DeviceVerificationRegistration from './device-verification-registration';

export default function DeviceVerificationStart() {
  const { deviceVerificationLink } = useLoginContext();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const [enablePolling, setEnablePolling] = useState(false);
  const deviceCheckUI = activeRpcPayload?.params?.[0]?.deviceCheckUI as boolean;
  const { redirectBackToAuthFlow } = useDeviceVerificationRedirect();

  const { isDeviceLinkExpired } = useDeviceVerificationPoller({
    verifyLink: deviceVerificationLink || '',
    enabled: enablePolling,
  });

  useEffect(() => {
    // start the poller upon page load
    if (deviceCheckUI || deviceCheckUI === undefined) {
      IFrameMessageService.showOverlay();
    } else {
      // navigate to the original auth method to restart
      AtomicRpcPayloadService.onEvent(DeviceVerificationEventEmit.Retry, () => {
        redirectBackToAuthFlow();
      });
      AtomicRpcPayloadService.emitJsonRpcEventResponse(DeviceVerificationEventOnReceived.DeviceVerificationEmailSent);
    }
    setEnablePolling(true);
    return () => setEnablePolling(false);
  }, []);

  useEffect(() => {
    if (isDeviceLinkExpired) {
      AtomicRpcPayloadService.emitJsonRpcEventResponse(DeviceVerificationEventOnReceived.DeviceVerificationLinkExpired);
    }
  }, [isDeviceLinkExpired]);

  return isDeviceLinkExpired ? <DeviceVerificationExpired /> : <DeviceVerificationRegistration />;
}
