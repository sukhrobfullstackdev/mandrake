import { Endpoint } from '@constants/endpoint';
import { HttpService } from '@http-services';
import { useMutation } from '@tanstack/react-query';

export type UsePersistSessionParams = {
  authUserId: string;
  requestOriginMessage: string;
};

export type SessionRefreshResponse = {
  authUserSessionToken: string;
  authUserId: string;
  email: string;
  phoneNumber: string;
};

export function usePersistSessionMutation() {
  return useMutation({
    mutationFn: ({ authUserId, requestOriginMessage }: UsePersistSessionParams) => {
      return HttpService.Relayer.Post(
        Endpoint.Session.Persist,
        {
          'Content-Type': 'application/json',
        },
        {
          auth_user_id: authUserId,
          request_origin_message: requestOriginMessage,
        },
      );
    },
  });
}

export function useRefreshSessionMutation() {
  return useMutation({
    mutationFn: (): Promise<SessionRefreshResponse> => {
      return HttpService.Relayer.Get(Endpoint.Session.Refresh);
    },
    retry: false,
  });
}
