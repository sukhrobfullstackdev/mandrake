import { Endpoint } from '@constants/endpoint';
import { HttpService } from '@http-services';

interface HederaSignMessageParams {
  authUserId: string;
  message: string;
}

export const hederaSignMessageQuery = (params: HederaSignMessageParams): Promise<{ signature: string }> => {
  const { authUserId, message } = params;

  const body = { auth_user_id: authUserId, message };

  return HttpService.Magic.Post(Endpoint.Multichain.HederaSignMessage, {}, body);
};
