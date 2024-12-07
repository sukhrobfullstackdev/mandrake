import { Endpoint } from '@constants/endpoint';
import { MfaInfoData } from '@custom-types/api-response';
import { HttpService } from '@http-services';
import { ApiResponseError } from '@lib/http-services/core/api-response-error';
import { UseMutationResult, useMutation } from '@tanstack/react-query';
import { setGlobalAppScopeHeaders } from '@utils/connect-utils';

interface LoginStartGoogleSignInBody {
  request_origin_message: string;
  token: string;
}

interface UseGoogleSignInStartParams {
  requestOriginMessage: string;
  token: string;
}

type LoginStartGoogleSignInResponse = {
  login_flow_context: string;
  factors_required: string[];
} & MfaInfoData;

interface LoginVerifyGoogleSignInBody {
  request_origin_message: string;
  login_flow_context: string;
}

interface UseGoogleSignInVerifyParams {
  requestOriginMessage: string;
  loginFlowContext: string;
}

type LoginVerifyGoogleSignInResponse = {
  authUserId: string;
  authUserSessionToken: string;
  refreshToken: string | null;
} & MfaInfoData;

export interface GoogleJwtPayload {
  aud: string;
  azp: string;
  email: string;
  email_verified: boolean;
  exp: number;
  family_name: string;
  given_name: string;
  iat: number;
  iss: string;
  jti: string;
  name: string;
  nbf: number;
  picture: string;
  sub: string;
}

export interface GoogleSignInResponse {
  credential: string;
  select_by: string;
}

export const useGoogleSignInStartQuery = (): UseMutationResult<
  LoginStartGoogleSignInResponse,
  ApiResponseError,
  UseGoogleSignInStartParams
> => {
  return useMutation({
    mutationFn: async (params: UseGoogleSignInStartParams) => {
      const { requestOriginMessage, token } = params;

      const body: LoginStartGoogleSignInBody = {
        token,
        request_origin_message: requestOriginMessage,
      };

      const response: LoginStartGoogleSignInResponse = await HttpService.Magic.Post(
        Endpoint.LegacySignInWithGoogle.Start,
        setGlobalAppScopeHeaders(),
        body,
      );

      return response;
    },
    gcTime: 1000,
  });
};

export function useGoogleSignInVerify(): UseMutationResult<
  LoginVerifyGoogleSignInResponse,
  ApiResponseError,
  UseGoogleSignInVerifyParams
> {
  return useMutation({
    mutationFn: async (params: UseGoogleSignInVerifyParams) => {
      const { requestOriginMessage, loginFlowContext } = params;

      const body: LoginVerifyGoogleSignInBody = {
        request_origin_message: requestOriginMessage,
        login_flow_context: loginFlowContext,
      };
      const response: LoginVerifyGoogleSignInResponse = await HttpService.Magic.Post(
        Endpoint.LegacySignInWithGoogle.Verify,
        setGlobalAppScopeHeaders(),
        body,
      );

      return response;
    },
    gcTime: 1000,
  });
}
