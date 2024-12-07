import { Endpoint } from '@constants/endpoint';
import { MfaInfoData } from '@custom-types/api-response';
import { HttpService } from '@http-services';
import { setDpopHeader } from '@lib/utils/dpop';
import { useMutation } from '@tanstack/react-query';

interface LoginOpenIdRequest {
  token?: string;
  provider_id?: string;
}

interface UseOidcLoginParams {
  providerId?: string;
  token?: string;
  webCryptoDpopJwt?: string;
}

export type OidcLoginResponse = {
  authUserId: string;
  authUserSessionToken: string;
  refreshToken: string;
} & MfaInfoData;

export function useOidcLoginQuery() {
  return useMutation({
    mutationFn: (params: UseOidcLoginParams): Promise<OidcLoginResponse> => {
      const { providerId, token, webCryptoDpopJwt } = params;

      const body: LoginOpenIdRequest = {
        token,
        provider_id: providerId,
      };

      const headers = { ...setDpopHeader(webCryptoDpopJwt) };

      return HttpService.Magic.Post(Endpoint.Oidc.Login, headers, body);
    },
    gcTime: 1000,
  });
}
