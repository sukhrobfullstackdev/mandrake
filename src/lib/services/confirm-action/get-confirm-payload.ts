import { Endpoint } from '@constants/endpoint';
import { HttpService } from '@lib/http-services';
import { EIP712TypedData } from 'eth-sig-util';

type ConfirmPayloadResponse = {
  action: string;
  payload: EIP712TypedData | string;
};

export function getConfirmPayload(jwt: string): Promise<ConfirmPayloadResponse> {
  const endpoint = Endpoint.ConfirmAction.Verify;
  const body = {
    temporary_confirmation_token: jwt,
  };
  return HttpService.Magic.Post(endpoint, {}, body);
}
