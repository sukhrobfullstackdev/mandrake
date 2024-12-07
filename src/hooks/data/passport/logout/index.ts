import { Endpoint } from '@constants/endpoint';
import { HttpService } from '@lib/http-services';
import { useMutation } from '@tanstack/react-query';

interface PassportLogoutParams {
  refreshToken: string;
}

export interface PassportLogoutResponse {
  status: string;
}

export function usePassportLogout() {
  return useMutation({
    mutationFn: ({ refreshToken }: PassportLogoutParams): Promise<PassportLogoutResponse> => {
      const body = {
        refresh_token: refreshToken,
      };
      return HttpService.PassportIdentity.Post(Endpoint.PassportIdentity.Logout, {}, body);
    },
    gcTime: 1000,
  });
}
