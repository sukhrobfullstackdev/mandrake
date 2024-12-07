import { Endpoint } from '@constants/endpoint';
import { HttpService } from '@lib/http-services';
import { useMutation } from '@tanstack/react-query';

interface PassportTokenParams {
  factorId: string;
}

interface PasskeyChallengeResponse {
  status: string;
  verifyFlowId: string;
  data: {
    rpId: string;
    user: {
      id: string;
      name: string;
      displayName: string;
    };
    challenge: string;
    pubKeyCredParams: PublicKeyCredentialParameters[];
    timeout: number;
    allowCredentials: [];
    attestation: string;
    userVerification: string;
  };
}

export function usePassportUserFactorChallengeMutation() {
  return useMutation({
    mutationFn: ({ factorId }: PassportTokenParams): Promise<PasskeyChallengeResponse> => {
      return HttpService.PassportIdentity.Post(`${Endpoint.PassportIdentity.UserFactor}/${factorId}/challenge`, {}, {});
    },
  });
}

export function usePasskeyChallengeMutation() {
  return useMutation({
    mutationFn: (): Promise<PasskeyChallengeResponse> => {
      return HttpService.PassportIdentity.Post(`${Endpoint.PassportIdentity.PasskeyChallenge}`, {}, {});
    },
  });
}
