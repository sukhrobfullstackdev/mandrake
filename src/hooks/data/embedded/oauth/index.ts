import { useMutation } from '@tanstack/react-query';

import { OAuth } from '@constants/endpoint';
import { MfaFactors } from '@custom-types/api-response';
import { OpenIDConnectUserInfo } from '@custom-types/open-id-connect';
import { HttpService } from '@http-services';
import { createJwtWithIframeKP, setDpopHeader } from '@lib/utils/dpop';
import { oauthQueryKeys } from './keys';

export type OAuthVerifyParams = {
  appID: string;
  authorizationCode: string;
  codeVerifier: string;
  redirectURI: string;
  jwt: string;
};

export type OAuthVerifyResponse = {
  authUserId: string;
  authUserSessionToken: string;
  oauthAccessToken: string;
  refreshToken?: string;
  factorsRequired?: MfaFactors;
  loginFlowContext?: string;
  userInfo: OpenIDConnectUserInfo<'camelCase'>;
};

export const useOAuthVerifyMutation = () => {
  return useMutation({
    mutationKey: oauthQueryKeys.verify(),
    mutationFn: async ({
      appID,
      authorizationCode,
      codeVerifier,
      redirectURI,
      jwt,
    }: OAuthVerifyParams): Promise<OAuthVerifyResponse> => {
      return HttpService.Magic.Post(
        OAuth.Verify,
        {
          ...setDpopHeader(await createJwtWithIframeKP(jwt)),
        },
        {
          oauth_app_id: appID,
          authorization_code: authorizationCode,
          code_verifier: codeVerifier,
          redirect_uri: redirectURI,
        },
      );
    },
  });
};
