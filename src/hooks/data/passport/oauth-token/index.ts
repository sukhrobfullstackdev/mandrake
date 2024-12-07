import { Endpoint } from '@constants/endpoint';
import { HttpService } from '@lib/http-services';
import { useMutation } from '@tanstack/react-query';

interface PassportTokenParams {
  grantType: 'authorization_code';
  code: string; // returned from `/authorize`
  redirectUri: string; // from sdk
  codeVerifier: string; //
}

interface PassportTokenResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  refreshToken: string;
  email: string;
  publicAddress: string;
  idToken: string;
}

export function usePassportOauthTokenMutation() {
  return useMutation({
    mutationFn: ({
      grantType,
      code,
      redirectUri,
      codeVerifier,
    }: PassportTokenParams): Promise<PassportTokenResponse> => {
      const body = {
        grant_type: grantType,
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      };

      return HttpService.PassportIdentity.Post(Endpoint.PassportIdentity.OauthToken, {}, body);
    },
  });
}
