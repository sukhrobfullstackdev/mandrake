import { Endpoint } from '@constants/endpoint';
import { HttpService } from '@http-services';

interface FlowSeedWalletParams {
  authUserId: string;
  encodedPublicKey: string;
  network: string;
}

export const flowSeedWalletQuery = (params: FlowSeedWalletParams): Promise<unknown> => {
  const { authUserId, encodedPublicKey, network } = params;

  const body = { auth_user_id: authUserId, encoded_public_key: encodedPublicKey, network };

  return HttpService.Magic.Post(Endpoint.Multichain.FlowSeedWallet, {}, body);
};
