import { Endpoint } from '@constants/endpoint';
import { HttpService } from '@lib/http-services';
import { ApiResponseError } from '@lib/http-services/core/api-response-error';
import { RecoveryMethodType } from '@magic-sdk/types';
import { useMutation, UseMutationResult } from '@tanstack/react-query';

export interface RecoveryFactorListResponse {
  [key: string]: {
    type: RecoveryMethodType;
    value: string;
    factorId: string;
  };
}

interface RecoveryFactorParams {
  email: string;
}

export function useGetFactorMutation(): UseMutationResult<
  RecoveryFactorListResponse,
  ApiResponseError,
  RecoveryFactorParams
> {
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const endpoint = Endpoint.AccountRecovery.RecoveryChallenge;
      const data = await HttpService.Magic.Get(`${endpoint}?email=${email}`);

      return data;
    },
    retry: 3,
  });
}

interface SendSmsParams {
  factorId: string;
}

interface RecoveryChallengeResponse {
  attemptId: string;
}

export function useSendSmsMutation(): UseMutationResult<RecoveryChallengeResponse, ApiResponseError, SendSmsParams> {
  return useMutation({
    mutationFn: async ({ factorId }: SendSmsParams): Promise<RecoveryChallengeResponse> => {
      const endpoint = Endpoint.AccountRecovery.RecoveryChallenge;
      const data = await HttpService.Magic.Post(endpoint, {}, { factor_id: factorId });

      return data;
    },
  });
}

interface RecoveryVerifyResponse {
  authUserId: string;
  authUserSessionToken: string;
  credential: string;
  refreshToken: string;
}

interface VerifyOtpParams {
  attemptId: string;
  otp: string;
}

export function useVerifyOtpMutation(): UseMutationResult<RecoveryVerifyResponse, ApiResponseError, VerifyOtpParams> {
  return useMutation({
    mutationFn: async ({ attemptId, otp }: VerifyOtpParams) => {
      const endpoint = Endpoint.AccountRecovery.RecoveryVerify;
      const data = await HttpService.Magic.Post(endpoint, {}, { attempt_id: attemptId, response: otp });

      return data;
    },
  });
}
