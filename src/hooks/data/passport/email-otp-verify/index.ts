import { Endpoint } from '@constants/endpoint';
import { HttpService } from '@lib/http-services';
import { useMutation } from '@tanstack/react-query';

interface PassportVerifyOTPParams {
  challengeResponse: string;
  factorId: string;
}

interface PassportVerifyEmailOtpResponse {
  status: string;
  factorId: string;
  nextFactor: number;
  sessionToken: string;
  refreshToken: string;
  ctx: object;
}

export function usePassportVerifyOTPMutation() {
  return useMutation({
    mutationFn: ({ factorId, challengeResponse }: PassportVerifyOTPParams): Promise<PassportVerifyEmailOtpResponse> => {
      const body = {
        factor_id: factorId,
        challenge_response: challengeResponse,
      };
      return HttpService.PassportIdentity.Post(Endpoint.PassportIdentity.VerifyFactor, {}, body);
    },
    gcTime: 1000,
  });
}
