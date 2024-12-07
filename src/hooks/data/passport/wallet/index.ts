import { Endpoint } from '@constants/endpoint';
import { EOAWalletResponse } from '@hooks/data/passport/wallet/keys';
import { HttpService } from '@lib/http-services';
import { useMutation } from '@tanstack/react-query';

interface CreateEOAWalletResponse {
  publicAddress: string;
  walletId: string;
  id: string;
}

export function useCreateEOAWalletMutation() {
  return useMutation({
    mutationFn: (): Promise<CreateEOAWalletResponse> => {
      return HttpService.PassportOps.Post(Endpoint.PassportOps.PassportWallet);
    },
    gcTime: 1000,
  });
}

export interface GetEOAWalletParams {
  accessToken: string;
}

export function useGetEOAWalletMutation() {
  return useMutation({
    mutationFn: ({ accessToken }: GetEOAWalletParams): Promise<EOAWalletResponse> => {
      return HttpService.PassportOps.Get(Endpoint.PassportOps.PassportWallet, {
        Authorization: `Bearer ${accessToken}`,
      });
    },
    gcTime: 1000,
  });
}
