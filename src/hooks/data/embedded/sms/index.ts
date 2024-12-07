import { Endpoint } from '@constants/endpoint';
import { MfaInfoData } from '@custom-types/api-response';
import { HttpService } from '@lib/http-services';
import { createJwtWithIframeKP, setDpopHeader } from '@lib/utils/dpop';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { ApiResponseError } from '@lib/http-services/core/api-response-error';

export type LoginWithSmsStartParams = {
  phoneNumber: string;
  requestOriginMessage: string;
  googleReCaptchaToken: string;
  jwt: string;
};

export type LoginWithSmsStartResponse = {
  utcTimestampMs: number;
  utcOtcExpiryMs: number;
  utcRetrygateMs: number;
  loginFlowContext: string;
};

export type LoginWithSmsVerifyParams = {
  phoneNumber: string;
  requestOriginMessage: string;
  oneTimeCode: string;
  loginFlowContext: string;
  jwt: string;
};

export type LoginWithSmsVerifyResponse = {
  authUserId: string;
  authUserSessionToken: string;
  refreshToken?: string;
} & MfaInfoData;

export function useLoginWithSmsStartMutation(): UseMutationResult<
  LoginWithSmsStartResponse,
  ApiResponseError,
  LoginWithSmsStartParams
> {
  return useMutation({
    mutationFn: async ({ phoneNumber, requestOriginMessage, googleReCaptchaToken, jwt }: LoginWithSmsStartParams) => {
      const headers = {
        ...setDpopHeader(await createJwtWithIframeKP(jwt)),
      };

      const response: LoginWithSmsStartResponse = await HttpService.Magic.Post(Endpoint.SMS.Start, headers, {
        phone_number: phoneNumber,
        request_origin_message: requestOriginMessage,
        challenge: googleReCaptchaToken,
      });

      return response;
    },
  });
}

export function useLoginWithSmsVerifyMutation(): UseMutationResult<
  LoginWithSmsVerifyResponse,
  ApiResponseError,
  LoginWithSmsVerifyParams
> {
  return useMutation({
    mutationFn: async ({
      phoneNumber,
      requestOriginMessage,
      oneTimeCode,
      loginFlowContext,
      jwt,
    }: LoginWithSmsVerifyParams) => {
      const headers = {
        ...setDpopHeader(await createJwtWithIframeKP(jwt)),
      };

      const response: LoginWithSmsVerifyResponse = await HttpService.Magic.Post(Endpoint.SMS.Verify, headers, {
        phone_number: phoneNumber,
        request_origin_message: requestOriginMessage,
        one_time_code: oneTimeCode,
        login_flow_context: loginFlowContext,
      });

      return response;
    },
  });
}
