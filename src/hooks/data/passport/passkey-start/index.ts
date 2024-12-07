import { Endpoint } from '@constants/endpoint';
import { HttpService } from '@lib/http-services';
import { useMutation } from '@tanstack/react-query';

export enum UserAuthFactorType {
  Passkey = 'passkey',
}
interface PasskeyCreateChallengeParams {
  type: UserAuthFactorType;
  username: string;
}

export interface PasskeyCreateChallengeResponse {
  status: string;
  verifyFlowId: string;
  data: {
    rp: {
      name: string;
      id: string;
    };
    user: {
      id: string;
      name: string;
      displayName: string;
    };
    challenge: string;
    pubKeyCredParams: PublicKeyCredentialParameters[];
    timeout: number;
    excludeCredentials: PublicKeyCredentialDescriptor[];
    attestation: string;
  };
}

export function usePasskeyCreateChallenge() {
  return useMutation({
    mutationFn: ({ type, username }: PasskeyCreateChallengeParams): Promise<PasskeyCreateChallengeResponse> => {
      const body = {
        type,
        username,
      };
      return HttpService.PassportIdentity.Post(Endpoint.PassportIdentity.CreatePasskeyChallene, {}, body);
    },
    gcTime: 1000,
  });
}
