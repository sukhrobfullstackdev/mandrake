import { Endpoint } from '@constants/endpoint';
import { HttpService } from '@lib/http-services';
import { useMutation } from '@tanstack/react-query';

interface PassportEmailLoginStartParams {
  type: 'email';
  value: string;
}

interface PassportEmailLoginStartResponse {
  factorId: string;
}

export function usePassportEmailLoginStart() {
  return useMutation({
    mutationFn: ({ type, value }: PassportEmailLoginStartParams): Promise<PassportEmailLoginStartResponse> => {
      const body = {
        type,
        value,
      };
      return HttpService.PassportIdentity.Post(Endpoint.PassportIdentity.CreateEmailChallenge, {}, body);
    },
    gcTime: 1000,
  });
}
