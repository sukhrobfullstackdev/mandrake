import { Endpoint } from '@constants/endpoint';
import { HttpService } from '@lib/http-services';
import { useMutation } from '@tanstack/react-query';

interface WebauthnReauthStartResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assertionOptions: any;
}
interface WebauthnReauthStartRequestParams {
  username: string;
}

export function useWebauthnReauthStartQuery() {
  return useMutation({
    mutationFn: (params: WebauthnReauthStartRequestParams): Promise<WebauthnReauthStartResponse> => {
      return HttpService.Magic.Post(Endpoint.WebAuthn.ReauthStart, undefined, { username: params.username });
    },
    gcTime: 1000,
  });
}

interface WebauthnReauthVerifyResponse {
  authUserId: string;
  authUserSessionToken: string;
}
interface WebauthnReauthVerifyRequestParams {
  username: string;
  assertionResponse: unknown;
}

export function useWebauthnReauthVerifyQuery() {
  return useMutation({
    mutationFn: (params: WebauthnReauthVerifyRequestParams): Promise<WebauthnReauthVerifyResponse> => {
      return HttpService.Magic.Post(Endpoint.WebAuthn.ReauthVerify, undefined, {
        username: params.username,
        assertion_response: params.assertionResponse,
      });
    },
    gcTime: 1000,
  });
}

interface WebauthnRegisterResponse {
  authUserId: string;
  authUserSessionToken: string;
}
interface WebauthnRegisterRequestParams {
  webauthnUserId: string;
  nickname: string;
  transport: string;
  userAgent: string;
  registrationResponse: unknown;
}

interface WebauthnRegisterRequestBody {
  webauthn_user_id: string;
  nickname: string;
  transport: string;
  user_agent: string;
  registration_response: unknown;
}

export function useWebauthnRegisterQuery() {
  return useMutation({
    mutationFn: (params: WebauthnRegisterRequestParams): Promise<WebauthnRegisterResponse> => {
      const body: WebauthnRegisterRequestBody = {
        webauthn_user_id: params.webauthnUserId,
        nickname: params.nickname,
        transport: params.transport,
        user_agent: params.userAgent,
        registration_response: params.registrationResponse,
      };

      return HttpService.Magic.Post(Endpoint.WebAuthn.Register, undefined, body);
    },
    gcTime: 1000,
  });
}

interface WebauthnRegisterDeviceRequestParams {
  authUserId: string;
  nickname: string;
  transport: string;
  userAgent: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registrationResponse: any;
}

interface WebauthnRegisterDeviceRequestBody {
  auth_user_id: string;
  nickname: string;
  transport: string;
  user_agent: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registration_response: any;
}

export function useWebauthnRegisterDeviceQuery() {
  return useMutation({
    mutationFn: (params: WebauthnRegisterDeviceRequestParams): Promise<unknown> => {
      const body: WebauthnRegisterDeviceRequestBody = {
        auth_user_id: params.authUserId,
        nickname: params.nickname,
        transport: params.transport,
        user_agent: params.userAgent,
        registration_response: params.registrationResponse,
      };
      return HttpService.Magic.Post(Endpoint.WebAuthn.RegisterDevice, undefined, body);
    },
    gcTime: 1000,
  });
}

interface WebauthnRegisterDeviceStartResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  credentialOptions: any;
}
interface WebauthnRegisterDeviceStartRequestParams {
  authUserId: string;
}

export function useWebauthnRegisterDeviceStartQuery() {
  return useMutation({
    mutationFn: (params: WebauthnRegisterDeviceStartRequestParams): Promise<WebauthnRegisterDeviceStartResponse> => {
      const path = `${Endpoint.WebAuthn.RegisterDeviceStart}?auth_user_id=${params.authUserId}`;
      return HttpService.Magic.Get(path);
    },
    gcTime: 1000,
  });
}

interface WebauthnRegistrationStartResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  credentialOptions: any;
  webauthnUserId: string;
}
interface WebauthnRegistrationStartRequestParams {
  username: string;
}

export function useWebauthnRegistrationStartQuery() {
  return useMutation({
    mutationFn: (params: WebauthnRegistrationStartRequestParams): Promise<WebauthnRegistrationStartResponse> => {
      return HttpService.Magic.Post(Endpoint.WebAuthn.RestrationStart, undefined, { username: params.username });
    },
    gcTime: 1000,
  });
}

interface WebauthnUnregisterRequestParams {
  authUserId: string;
  webauthnId: string;
}
interface WebauthnUnregisterRequestBody {
  auth_user_id: string;
  webauthn_id: string;
}
export function useUnregisterWebauthnQuery() {
  return useMutation({
    mutationFn: (params: WebauthnUnregisterRequestParams): Promise<unknown> => {
      const body: WebauthnUnregisterRequestBody = {
        auth_user_id: params.authUserId,
        webauthn_id: params.webauthnId,
      };
      return HttpService.Magic.Post(Endpoint.WebAuthn.Unregister, undefined, body);
    },
    gcTime: 1000,
  });
}

interface WebauthnUpdateRequestParams {
  nickname: string;
  authUserId: string;
  webauthnId: string;
}
interface WebauthnUpdateRequestBody {
  nickname: string;
  auth_user_id: string;
  webauthn_id: string;
}
export function useUpdateWebauthnQuery() {
  return useMutation({
    mutationFn: (params: WebauthnUpdateRequestParams): Promise<unknown> => {
      const body: WebauthnUpdateRequestBody = {
        auth_user_id: params.authUserId,
        webauthn_id: params.webauthnId,
        nickname: params.nickname,
      };
      return HttpService.Magic.Post(Endpoint.WebAuthn.Update, undefined, body);
    },
    gcTime: 1000,
  });
}
