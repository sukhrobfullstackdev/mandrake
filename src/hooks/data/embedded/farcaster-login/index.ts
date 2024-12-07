import { Farcaster } from '@constants/endpoint';
import { HttpService } from '@lib/http-services';
import { useMutation } from '@tanstack/react-query';

export interface UseFarcasterLoginParams {
  channel_token: string;
  message: string;
  signature: string;
  fid: number;
  username: string;
}

export type FarcasterLoginResponse = {
  authUserId: string;
  authUserSessionToken: string;
  refreshToken: string;
};

export function useFarcasterLoginMutation() {
  return useMutation({
    mutationFn: (params: UseFarcasterLoginParams): Promise<FarcasterLoginResponse> => {
      return HttpService.Magic.Post(Farcaster.Verify, {}, params);
    },
    gcTime: 1000,
  });
}
