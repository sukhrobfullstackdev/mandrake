import { Endpoint } from '@constants/endpoint';
import { MagicAPIResponse } from '@custom-types/api-response';
import { HttpService } from '@http-services';
import { signIframeUA } from '@lib/device-verification/ua-sig';
import { ApiResponseError } from '@lib/http-services/core/api-response-error';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { setGlobalAppScopeHeaders } from '@utils/connect-utils';
import { createJwtWithIframeKP, setDpopHeader } from '@utils/dpop';

interface StartTemporaryOtpEnrollResponse {
  secret: string;
  mfaInfo: string;
}

interface UseStartTemporaryOtpEnrollParams {
  authUserId: string;
  jwt?: string;
}

interface UseFinishTemporaryOtpEnrollParams {
  authUserId: string;
  totp: string;
  mfaInfo: string;
  jwt?: string;
}

interface FinishTemporaryOtpEnrollResponse {
  recoveryCodes: Array<string>;
}

interface UseVerifyTemporaryOtpParams {
  loginFlowContext: string;
  totp: string;
  jwt?: string;
}

export interface VerifyTemporaryOtpResponse {
  authUserId: string;
  refreshToken: string;
  authUserSessionToken: string;
}

interface UseVerifyTemporaryOtpRecoveryCodeParams {
  loginFlowContext: string;
  totp: string;
  jwt?: string;
}

interface VerifyTemporaryOtpRecoveryCodeResponse {
  authUserId: string;
  refreshToken: string;
  authUserSessionToken: string;
}

interface UseDisableTemporaryOtpParams {
  authUserId: string;
  totp: string;
  jwt?: string;
}

interface UseDisableTemporaryOtpRecoveryCodeParams {
  authUserId: string;
  recoveryCode: string;
  jwt?: string;
}

export const useStartTemporaryOtpEnrollMutation = () => {
  return useMutation({
    mutationFn: async (params: UseStartTemporaryOtpEnrollParams): Promise<StartTemporaryOtpEnrollResponse> => {
      const { authUserId, jwt } = params;
      const endpoint = Endpoint.MFA.StartTemporaryOtpEnroll;

      return HttpService.Magic.Post(
        endpoint,
        {
          ...setDpopHeader(await createJwtWithIframeKP(jwt)),
          ...setGlobalAppScopeHeaders(),
          'ua-sig': await signIframeUA(),
        },
        { auth_user_id: authUserId },
      );
    },
    gcTime: 1000,
  });
};

export const useFinishTemporaryOtpEnrollMutation = (): UseMutationResult<
  FinishTemporaryOtpEnrollResponse,
  ApiResponseError,
  UseFinishTemporaryOtpEnrollParams
> => {
  return useMutation({
    mutationFn: async (params: UseFinishTemporaryOtpEnrollParams): Promise<FinishTemporaryOtpEnrollResponse> => {
      const { authUserId, totp, mfaInfo, jwt } = params;
      const endpoint = Endpoint.MFA.FinishTemporaryOtpEnroll;

      return HttpService.Magic.Post(
        endpoint,
        {
          ...setDpopHeader(await createJwtWithIframeKP(jwt)),
          ...setGlobalAppScopeHeaders(),
          'ua-sig': await signIframeUA(),
        },
        { auth_user_id: authUserId, one_time_code: totp, mfa_info: mfaInfo },
      );
    },
    gcTime: 1000,
  });
};

export const useVerifyTemporaryOtpMutation = (): UseMutationResult<
  VerifyTemporaryOtpResponse,
  ApiResponseError,
  UseVerifyTemporaryOtpParams
> => {
  return useMutation({
    mutationFn: async (params: UseVerifyTemporaryOtpParams): Promise<VerifyTemporaryOtpResponse> => {
      const { loginFlowContext, totp, jwt } = params;
      const endpoint = Endpoint.MFA.VerifyTemporaryOtp;

      return HttpService.Magic.Post(
        endpoint,
        {
          ...setDpopHeader(await createJwtWithIframeKP(jwt)),
          ...setGlobalAppScopeHeaders(),
          'ua-sig': await signIframeUA(),
        },
        { login_flow_context: loginFlowContext, one_time_code: totp },
      );
    },
    gcTime: 1000,
  });
};

export const useVerifyTemporaryOtpRecoveryCodeMutation = (): UseMutationResult<
  VerifyTemporaryOtpRecoveryCodeResponse,
  ApiResponseError,
  UseVerifyTemporaryOtpRecoveryCodeParams
> => {
  return useMutation({
    mutationFn: async (
      params: UseVerifyTemporaryOtpRecoveryCodeParams,
    ): Promise<VerifyTemporaryOtpRecoveryCodeResponse> => {
      const { loginFlowContext, totp, jwt } = params;
      const endpoint = Endpoint.MFA.VerifyTemporaryOtpRecoveryCode;

      return HttpService.Magic.Post(
        endpoint,
        {
          ...setDpopHeader(await createJwtWithIframeKP(jwt)),
          ...setGlobalAppScopeHeaders(),
          'ua-sig': await signIframeUA(),
        },
        { login_flow_context: loginFlowContext, recovery_code: totp },
      );
    },
    gcTime: 1000,
  });
};

export const useDisableTemporaryOtpMutation = (): UseMutationResult<
  MagicAPIResponse,
  ApiResponseError,
  UseDisableTemporaryOtpParams
> => {
  return useMutation({
    mutationFn: async (params: UseDisableTemporaryOtpParams): Promise<MagicAPIResponse> => {
      const { authUserId, totp, jwt } = params;
      const endpoint = Endpoint.MFA.DisableTemporaryOtp;

      return HttpService.Magic.Post(
        endpoint,
        {
          ...setDpopHeader(await createJwtWithIframeKP(jwt)),
          ...setGlobalAppScopeHeaders(),
          'ua-sig': await signIframeUA(),
        },
        { auth_user_id: authUserId, one_time_code: totp },
      );
    },
    gcTime: 1000,
  });
};

export const useDisableTemporaryOtpRecoveryCodeMutation = (): UseMutationResult<
  MagicAPIResponse,
  ApiResponseError,
  UseDisableTemporaryOtpRecoveryCodeParams
> => {
  return useMutation({
    mutationFn: async (params: UseDisableTemporaryOtpRecoveryCodeParams): Promise<MagicAPIResponse> => {
      const { authUserId, recoveryCode, jwt } = params;
      const endpoint = Endpoint.MFA.DisableTemporaryOtpRecoveryCode;

      return HttpService.Magic.Post(
        endpoint,
        {
          ...setDpopHeader(await createJwtWithIframeKP(jwt)),
          ...setGlobalAppScopeHeaders(),
          'ua-sig': await signIframeUA(),
        },
        { auth_user_id: authUserId, recovery_code: recoveryCode },
      );
    },
    gcTime: 1000,
  });
};
