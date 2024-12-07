import { Endpoint } from '@constants/endpoint';
import { MfaInfoData } from '@custom-types/api-response';
import { HttpService } from '@http-services';
import { signIframeUA } from '@lib/device-verification/ua-sig';
import { ApiResponseError } from '@lib/http-services/core/api-response-error';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { isGlobalAppScope, setGlobalAppScopeHeaders } from '@utils/connect-utils';
import { createJwtWithIframeKP, setDpopHeader } from '@utils/dpop';

interface LoginWithEmailOtpStartBody {
  email: string;
  request_origin_message: string;
  overrides?: {
    variation?: string;
  };
}

interface UseLoginWithEmailOtpVerifyParams {
  email: string;
  requestOriginMessage: string;
  oneTimeCode: string;
  loginFlowContext: string;
  jwt: string;
}

export type LoginWithEmailOtpStartResponse = {
  utcTimestampMs: number;
  utcOtcExpiryMs: number;
  utcRetrygateMs: number;
  loginFlowContext: string;
};

export type LoginWithEmailOtpVerifyResponse = {
  authUserId: string;
  authUserSessionToken: string;
  refreshToken: string | null;
} & MfaInfoData;

interface UseSendEmailOtpParams {
  email: string;
  requestOriginMessage: string;
  jwt?: string;
  overrides?: { variation: string };
}

export const useSendEmailOtpStartQuery = (): UseMutationResult<
  LoginWithEmailOtpStartResponse,
  ApiResponseError,
  UseSendEmailOtpParams
> => {
  return useMutation({
    mutationFn: async (params: UseSendEmailOtpParams) => {
      const { email, requestOriginMessage, overrides, jwt } = params;
      const endpoint = isGlobalAppScope() ? Endpoint.Universal.Start : Endpoint.EmailOtp.Start;

      const body: LoginWithEmailOtpStartBody = {
        email,
        request_origin_message: requestOriginMessage,
        overrides,
      };

      const headers = {
        ...setDpopHeader(await createJwtWithIframeKP(jwt)),
        ...setGlobalAppScopeHeaders(),
        'ua-sig': await signIframeUA(),
      };

      const response: LoginWithEmailOtpStartResponse = await HttpService.Magic.Post(endpoint, headers, body);

      return response;
    },
    gcTime: 1000,
  });
};

export function useLoginWithEmailOtpVerify(): UseMutationResult<
  LoginWithEmailOtpVerifyResponse,
  ApiResponseError,
  UseLoginWithEmailOtpVerifyParams
> {
  return useMutation({
    mutationFn: (params: UseLoginWithEmailOtpVerifyParams): Promise<LoginWithEmailOtpVerifyResponse> => {
      const { email, requestOriginMessage, oneTimeCode, loginFlowContext, jwt } = params;

      const body = {
        email,
        request_origin_message: requestOriginMessage,
        one_time_code: oneTimeCode,
        login_flow_context: loginFlowContext,
      };

      const headers = {
        ...setDpopHeader(jwt),
      };

      return HttpService.Magic.Post(Endpoint.EmailOtp.Verify, headers, body);
    },
    gcTime: 1000,
  });
}
