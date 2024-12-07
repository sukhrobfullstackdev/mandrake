import { Endpoint } from '@constants/endpoint';
import { HttpService } from '@lib/http-services';
import { useMutation } from '@tanstack/react-query';

interface PassportAuthorizeParams {
  responseType: string;
  redirectUri: string;
  codeChallenge: string;
  state: string;
  scope?: string;
}

interface PassportAuthorizeResponse {
  code: string;
  state: string;
}

export function usePassportAuthorizeMutation() {
  return useMutation({
    mutationFn: ({
      redirectUri,
      responseType,
      codeChallenge,
      scope,
      state,
    }: PassportAuthorizeParams): Promise<PassportAuthorizeResponse> => {
      const body = {
        redirect_uri: redirectUri,
        response_type: responseType,
        code_challenge: codeChallenge,
        scope,
        state,
      };

      return HttpService.PassportIdentity.Post(Endpoint.PassportIdentity.OauthAuthorize, {}, body);
    },
    gcTime: 1000,
  });
}
