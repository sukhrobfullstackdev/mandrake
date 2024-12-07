import { Endpoint } from '@constants/endpoint';
import { HttpService } from '@http-services';
import { useMutation } from '@tanstack/react-query';
import { setDpopHeader } from '@utils/dpop';

interface UseRedirectLoginParams {
  magicCredential?: string;
  jwt?: string;
}

export type RedirectLoginResponse = {
  authUserId: string;
  authUserSessionToken: string;
  email: string;
  rom: string; // request origin message
  refreshToken?: string;
};

export function useRedirectLoginQuery() {
  return useMutation({
    mutationFn: (params: UseRedirectLoginParams): Promise<RedirectLoginResponse> => {
      const { magicCredential, jwt } = params;

      const headers = {
        ...(magicCredential ? { authorization: `Bearer ${magicCredential}` } : {}),
        ...setDpopHeader(jwt),
      };

      return HttpService.Magic.Post(Endpoint.Redirect.Login, headers, undefined);
    },
    gcTime: 1000,
  });
}
