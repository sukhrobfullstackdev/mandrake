import { Endpoint } from '@constants/endpoint';
import { MfaInfoData } from '@custom-types/api-response';
import { emailLinkStatusFetch, EmailLinkStatusResponse } from '@hooks/data/embedded/email-link/fetchers';
import {
  EmailLinkPollerParams,
  EmailLinkPollerQueryKey,
  emailLinkQueryKeys,
} from '@hooks/data/embedded/email-link/keys';
import { HttpService } from '@http-services';
import { signIframeUA } from '@lib/device-verification/ua-sig';
import { ApiResponseError } from '@lib/http-services/core/api-response-error';
import { useMutation, UseMutationResult, useQuery, UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';
import { createJwtWithIframeKP, setDpopHeader } from '@utils/dpop';

interface LoginWithEmailLinkStartBody {
  email: string;
  request_origin_message: string;
  redirect_url?: string;
  app_name?: string;
  asset_uri?: string;
  overrides?: {
    variation?: string;
  };
}

export type LoginWithEmailLinkStartResponse = {
  oneTimePasscode: string;
} & MfaInfoData;

interface UseSendEmailLinkParams {
  email: string;
  requestOriginMessage: string;
  jwt?: string;
  overrides?: { variation: string };
  redirectURI?: string;
}

export const useSendEmailLinkStartQuery = (): UseMutationResult<
  LoginWithEmailLinkStartResponse,
  ApiResponseError,
  UseSendEmailLinkParams
> => {
  return useMutation({
    mutationFn: async (params: UseSendEmailLinkParams) => {
      const { email, redirectURI, requestOriginMessage, overrides, jwt } = params;
      const endpoint = `${Endpoint.EmailLink.Start}`;

      const body: LoginWithEmailLinkStartBody = {
        email,
        redirect_url: redirectURI,
        request_origin_message: requestOriginMessage,
        overrides,
      };

      const headers = {
        ...setDpopHeader(await createJwtWithIframeKP(jwt)),
        'ua-sig': await signIframeUA(),
      };

      const response: LoginWithEmailLinkStartResponse = await HttpService.Magic.Post(endpoint, headers, body);

      return response;
    },
    gcTime: 1000,
  });
};

/**
 *  Status Poller
 */
export const useEmailLinkStatusPollerQuery = (
  params: EmailLinkPollerParams,
  config?: Omit<
    UseQueryOptions<EmailLinkStatusResponse, ApiResponseError, EmailLinkStatusResponse, EmailLinkPollerQueryKey>,
    'queryKey' | 'queryFn'
  >,
): UseQueryResult<EmailLinkStatusResponse, ApiResponseError> =>
  useQuery({
    queryKey: emailLinkQueryKeys.status(params),
    queryFn: emailLinkStatusFetch(),
    ...config,
  });

/**
 *  Redirect Confirm
 */
type EmailLinkRedirectConfirmResponse = {
  authUserId: string;
  ephemeralAuthUserSessionToken: string;
  email: string;
};

type UseEmailLinkRedirectConfirmParams = {
  env: 'testnet' | 'mainnet';
  tlt: string; // Temporary login token
  loginFlowContext?: string;
};
type RedirectConfirmBody = {
  tlt: string; // Temporary login token
  login_flow_context?: string;
};

export const useEmailLinkRedirectConfirmQuery = (): UseMutationResult<
  EmailLinkRedirectConfirmResponse,
  ApiResponseError,
  UseEmailLinkRedirectConfirmParams
> => {
  return useMutation({
    mutationFn: async (params: UseEmailLinkRedirectConfirmParams) => {
      const { loginFlowContext, tlt, env } = params;

      const endpoint = `${Endpoint.EmailLink.RedirectConfirm}?e=${env}`;

      const body: RedirectConfirmBody = {
        tlt,
        login_flow_context: loginFlowContext,
      };

      const response: EmailLinkRedirectConfirmResponse = await HttpService.Magic.Post(endpoint, {}, body);

      return response;
    },
    gcTime: 1000,
  });
};

type LoginVerifyBody = {
  tlt: string; // Temporary login token
  one_time_passcode?: string;
};

type UseEmailLinkLoginVerifyParams = {
  tlt: string; // Temporary login token
  env: 'testnet' | 'mainnet';
  oneTimePasscode?: string;
};

export const useEmailLinkLoginVerifyQuery = (): UseMutationResult<
  EmailLinkRedirectConfirmResponse,
  ApiResponseError,
  UseEmailLinkLoginVerifyParams
> => {
  return useMutation({
    mutationFn: async (params: UseEmailLinkLoginVerifyParams) => {
      const { oneTimePasscode, tlt, env } = params;

      const endpoint = `${Endpoint.EmailLink.LoginVerify}?e=${env}`;

      const body: LoginVerifyBody = {
        tlt: tlt ?? '',
        one_time_passcode: oneTimePasscode,
      };

      const response: EmailLinkRedirectConfirmResponse = await HttpService.Magic.Post(endpoint, {}, body);

      return response;
    },
    gcTime: 1000,
  });
};

/**
 * Request Anomaly
 */
type RequestAnomalyParams = {
  tlt?: string;
  env: 'testnet' | 'mainnet';
};

type AnomalyResponse = {
  role?: {
    is_admin?: boolean;
  };
};
export const useEmailLinkAnomalyApprove = (): UseMutationResult<
  AnomalyResponse,
  ApiResponseError,
  RequestAnomalyParams
> => {
  return useMutation({
    mutationFn: async (params: RequestAnomalyParams) => {
      const { tlt, env } = params;

      const endpoint = `${Endpoint.EmailLink.AnomalyApprove}?tlt=${tlt}&e=${env}`;

      const response: AnomalyResponse = await HttpService.Magic.Post(endpoint);

      return response;
    },
    gcTime: 1000,
  });
};

export const useEmailLinkAnomalyBlock = (): UseMutationResult<
  AnomalyResponse,
  ApiResponseError,
  RequestAnomalyParams
> => {
  return useMutation({
    mutationFn: async (params: RequestAnomalyParams) => {
      const { tlt, env } = params;

      const endpoint = `${Endpoint.EmailLink.AnomalyBlock}?tlt=${tlt}&e=${env}`;

      const response: AnomalyResponse = await HttpService.Magic.Post(endpoint);

      return response;
    },
    gcTime: 1000,
  });
};
