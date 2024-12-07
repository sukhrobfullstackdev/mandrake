import { Endpoint } from '@constants/endpoint';
import { HttpService } from '@lib/http-services';
import { useMutation } from '@tanstack/react-query';

interface PassportPasskeyVerifyParams {
  verifyFlowId: string;
  attestation: unknown;
}

export interface PassportPasskeyVerifyResponse {
  factorId: string;
  status: string;
  nextFactor: string;
  accessToken: string;
  refreshToken: string;
  ctx: unknown;
}

export function usePassportPasskeyLoginVerify() {
  return useMutation({
    mutationFn: ({
      verifyFlowId,
      attestation,
    }: PassportPasskeyVerifyParams): Promise<PassportPasskeyVerifyResponse> => {
      const body = {
        verify_flow_id: verifyFlowId,
        challenge_response: attestation,
      };
      return HttpService.PassportIdentity.Post(Endpoint.PassportIdentity.VerifyFactor, {}, body);
    },
    gcTime: 1000,
  });
}
