import { Endpoint } from '@constants/endpoint';
import { MagicAPIResponse, MfaInfoData } from '@custom-types/api-response';
import { HttpService } from '@http-services';
import { ApiResponseError } from '@lib/http-services/core/api-response-error';
import { UseMutationResult, useMutation } from '@tanstack/react-query';
import { setGlobalAppScopeHeaders } from '@utils/connect-utils';

export type SupportedThirdPartyWallets = 'WALLET_CONNECT';

interface LoginWithWalletStartRequest {
  public_address: string;
  wallet_provider: SupportedThirdPartyWallets;
  wallet_type: 'ETH';
  chain_id: number;
}

type LoginWithWalletStartResponse = MagicAPIResponse<
  {
    authUserId: string;
    authUserSessionToken: string;
    refreshToken: string;
  } & MfaInfoData
>;

interface UseWalletStartParams {
  publicAddress: string;
  walletProvider: SupportedThirdPartyWallets;
}

export const useThirdPartyWalletStartQuery = (): UseMutationResult<
  LoginWithWalletStartResponse,
  ApiResponseError,
  UseWalletStartParams
> => {
  return useMutation({
    mutationFn: async (params: UseWalletStartParams) => {
      const { publicAddress, walletProvider } = params;

      const body: LoginWithWalletStartRequest = {
        public_address: publicAddress,
        wallet_provider: walletProvider,
        wallet_type: 'ETH',
        chain_id: 1,
      };

      const response: LoginWithWalletStartResponse = await HttpService.Magic.Post(
        Endpoint.ThirdPartyWallet.Start,
        setGlobalAppScopeHeaders(),
        body,
      );

      return response;
    },
    gcTime: 1000,
  });
};
