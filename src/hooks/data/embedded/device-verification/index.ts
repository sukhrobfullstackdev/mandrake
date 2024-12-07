import { Endpoint } from '@constants/endpoint';
import { deviceVerificationStatusFetch } from '@hooks/data/embedded/device-verification/fetchers';
import {
  DeviceVerificationPollerParams,
  DeviceVerificationPollerQueryKey,
  deviceVerificationQueryKeys,
} from '@hooks/data/embedded/device-verification/keys';
import { HttpService } from '@http-services';
import { useMutation, useQuery, UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';

export type DeviceVerificationState = { status: 'approved' | 'rejected' | 'pending' };
export const useDeviceVerificationStatusPollerQuery = (
  params: DeviceVerificationPollerParams,
  config?: Omit<
    UseQueryOptions<DeviceVerificationState, Error, DeviceVerificationState, DeviceVerificationPollerQueryKey>,
    'queryKey' | 'queryFn'
  >,
): UseQueryResult<DeviceVerificationState> =>
  useQuery({
    queryKey: deviceVerificationQueryKeys.status(params),
    queryFn: deviceVerificationStatusFetch(),
    ...config,
  });

export const useDeviceCheckQuery = () => {
  return useMutation({
    mutationFn: (deviceProfileId: string): Promise<DeviceVerificationState> => {
      const endpoint = `${Endpoint.DeviceVerification.DeviceProfile}/${deviceProfileId}`;

      return HttpService.Magic.Get(endpoint);
    },
    gcTime: 1000,
  });
};

interface UseDeviceApproveParams {
  deviceProfileId: string;
  deviceToken: string;
  isApproved: boolean;
}

interface DeviceApproveBody {
  action: string;
  token: string;
}

export const useDeviceApproveQuery = () => {
  return useMutation({
    mutationFn: (params: UseDeviceApproveParams) => {
      const { deviceProfileId, deviceToken, isApproved } = params;
      const body: DeviceApproveBody = {
        action: isApproved ? 'approve' : 'reject',
        token: deviceToken,
      };

      const endpoint = `${Endpoint.DeviceVerification.DeviceProfile}/${deviceProfileId}/review`;

      return HttpService.Magic.Post(endpoint, {}, body);
    },
    gcTime: 1000,
  });
};
