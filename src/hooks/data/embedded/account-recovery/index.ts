import { Endpoint } from '@constants/endpoint';
import { HttpService } from '@http-services';
import { ApiResponseError } from '@lib/http-services/core/api-response-error';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import qs from 'qs';

type AuthUserFactorParams = {
  authUserId: string | null;
  value?: string | null;
  type: string;
  isAuthenticatedEnabled?: boolean;
  isRecoveryEnabled?: boolean;
  credential?: string;
};

type AuthUserFactorPatchParams = {
  authUserId: string | null;
  value?: string | null;
  type: string;
  isRecoveryEnabled?: boolean;
  factorId?: string;
};

type FactorChallengeParams = {
  authUserId: string | null;
  factorId: string;
  credential?: string;
};

type FactorVerifyParams = {
  authUserId: string | null;
  attemptId: string;
  response: string;
};

type RecoveryFactor = {
  auth_user_id: string;
  is_active: boolean;
  id: string; // factorId
  is_recovery_enabled: boolean;
  time_created: number;
  time_updated: number;
  time_verified: number;
  type: RecoveryMethodType;
  value: string;
};

export enum RecoveryMethodType {
  PhoneNumber = 'phone_number',
  EmailAddress = 'email_address',
}

export function useCreateFactorMutation(): UseMutationResult<string, ApiResponseError, AuthUserFactorParams> {
  return useMutation({
    mutationFn: async ({
      authUserId,
      isRecoveryEnabled,
      isAuthenticatedEnabled,
      ...params
    }: AuthUserFactorParams): Promise<string> => {
      const endpoint = Endpoint.AccountRecovery.Factor;

      const { id } = await HttpService.Magic.Post(
        endpoint,
        {},
        {
          ...params,
          auth_user_id: authUserId,
          is_recovery_enabled: isRecoveryEnabled,
          is_authenticated_enabled: isAuthenticatedEnabled,
        },
      );

      return id;
    },
  });
}

export function usePatchFactorMutation(): UseMutationResult<string, ApiResponseError, AuthUserFactorPatchParams> {
  return useMutation({
    mutationFn: async ({
      authUserId,
      isRecoveryEnabled,
      factorId,
      ...params
    }: AuthUserFactorPatchParams): Promise<string> => {
      const endpoint = `${Endpoint.AccountRecovery.Factor}/${factorId}`;

      const { id } = await HttpService.Magic.Patch(
        endpoint,
        {},
        {
          ...params,
          auth_user_id: authUserId,
          is_recovery_enabled: isRecoveryEnabled,
        },
      );
      return id;
    },
  });
}

export function useFactorChallengeMutation(): UseMutationResult<string, ApiResponseError, FactorChallengeParams> {
  return useMutation({
    mutationFn: async ({ authUserId, factorId }: FactorChallengeParams): Promise<string> => {
      const endpoint = Endpoint.AccountRecovery.Challenge;

      const data = await HttpService.Magic.Post(endpoint, {}, { factor_id: factorId, auth_user_id: authUserId });

      return data.attemptId;
    },
  });
}

export function useEmailUpdateChallengeMutation() {
  return useMutation({
    mutationFn: async ({ authUserId, factorId, ...params }: FactorChallengeParams): Promise<string> => {
      const endpoint = Endpoint.AccountRecovery.EmailUpdateChallenge;

      const data = await HttpService.Magic.Post(
        endpoint,
        {},
        { factor_id: factorId, auth_user_id: authUserId, ...params },
      );

      return data.attemptId;
    },
  });
}

export function useFactorVerifyMutation(): UseMutationResult<string, ApiResponseError, FactorVerifyParams> {
  return useMutation({
    mutationFn: async ({ attemptId, authUserId, ...params }: FactorVerifyParams): Promise<string> => {
      const endpoint = Endpoint.AccountRecovery.Verify;

      const { credential } = await HttpService.Magic.Post(
        endpoint,
        {},
        { attempt_id: attemptId, auth_user_id: authUserId, ...params },
      );

      return credential;
    },
  });
}

export function useVerifyUpdatedEmailMutation(): UseMutationResult<string, ApiResponseError, FactorVerifyParams> {
  return useMutation({
    mutationFn: async ({ attemptId, authUserId, ...params }: FactorVerifyParams): Promise<string> => {
      const endpoint = Endpoint.AccountRecovery.EmailUpdateVerify;

      const { credential } = await HttpService.Magic.Post(
        endpoint,
        {},
        { attempt_id: attemptId, auth_user_id: authUserId, ...params },
      );

      return credential;
    },
  });
}

export function useGetRecoveryFactorsQuery(): UseMutationResult<
  { [key: string]: RecoveryFactor },
  ApiResponseError,
  string
> {
  return useMutation({
    mutationFn: (authUserId: string): Promise<{ [key: string]: RecoveryFactor }> => {
      return HttpService.Magic.Get(`${Endpoint.AccountRecovery.Factor}?auth_user_id=${authUserId}`);
    },
  });
}

export function useDeleteRecoveryFactorMutation(): UseMutationResult<string, ApiResponseError, FactorChallengeParams> {
  return useMutation({
    mutationFn: ({ authUserId, factorId }: FactorChallengeParams): Promise<string> => {
      const query = qs.stringify({ auth_user_id: authUserId });
      return HttpService.Magic.Delete(`${Endpoint.AccountRecovery.Factor}/${factorId}?${query}`);
    },
  });
}
