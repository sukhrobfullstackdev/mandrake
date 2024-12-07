import { DeviceVerificationState } from '@hooks/data/embedded/device-verification/index';
import { DeviceVerificationPollerQueryKey } from '@hooks/data/embedded/device-verification/keys';
import { HttpService } from '@http-services';
import { QueryFunction } from '@tanstack/react-query';

export const deviceVerificationStatusFetch =
  (): QueryFunction<DeviceVerificationState, DeviceVerificationPollerQueryKey> =>
  ({ queryKey: [, { verifyLink }] }) =>
    HttpService.Magic.Get(verifyLink);
