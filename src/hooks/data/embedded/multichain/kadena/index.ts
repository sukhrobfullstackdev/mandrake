import { Endpoint } from '@constants/endpoint';
import { useStore } from '@hooks/store';
import { HttpService } from '@http-services';
import { getNetworkName } from '@lib/utils/network-name';

interface KadenaCreateWalletParams {
  authUserId: string;
  hash: string;
}

export interface KadenaCreateWalletResponse {
  sig: string;
  pubKey: string;
}

export interface KadenaVerifySpireKeyLoginParams {
  publicKey: string;
  transactionCommand: string;
  transactionHash: string;
  signature: string;
  authenticatorData: string;
  clientDataJson: string;
}

interface KadenaVerifySpireKeyLoginResponse {
  authUserId: string;
  authUserSessionToken: string;
}

export const kadenaCreateWalletQuery = (params: KadenaCreateWalletParams): Promise<KadenaCreateWalletResponse> => {
  const { authUserId, hash } = params;
  const { apiKey, ethNetwork, version, ext } = useStore.getState().decodedQueryParams;
  const network = getNetworkName(ethNetwork, version, apiKey || '', false, ext) as 'MAINNET' | 'CANONICAL_TESTNET';
  const body = { auth_user_id: authUserId, tx_hash: hash, network };
  return HttpService.Magic.Post(Endpoint.Multichain.KadenaCreateWallet, {}, body);
};

export const kadenaVerifySpireKeyLogin = (
  params: KadenaVerifySpireKeyLoginParams,
): Promise<KadenaVerifySpireKeyLoginResponse> => {
  const { publicKey, transactionCommand, transactionHash, signature, authenticatorData, clientDataJson } = params;
  return HttpService.Magic.Post(
    Endpoint.Multichain.KadenaVerifySpireKeyLogin,
    {},
    {
      public_key: publicKey,
      signature,
      authenticator_data: authenticatorData,
      client_data: clientDataJson,
      transaction_hash: transactionHash,
      transaction_command: transactionCommand,
    },
  );
};
