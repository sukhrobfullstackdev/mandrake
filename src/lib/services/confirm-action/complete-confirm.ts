import { Endpoint } from '@constants/endpoint';
import { HttpService } from '@lib/http-services';

interface ConfirmCompleteBody {
  temporary_confirmation_token: string;
  result: 'APPROVED' | 'REJECTED';
}

export enum ConfirmResponse {
  Approved = 'APPROVED',
  Rejected = 'REJECTED',
}

export function completeConfirm(
  temporary_confirmation_token: string,
  api_key: string,
  confirm_response: ConfirmResponse,
) {
  const endpoint = Endpoint.ConfirmAction.Complete;

  const body: ConfirmCompleteBody = {
    temporary_confirmation_token,
    result: confirm_response,
  };
  const headers = {
    'x-magic-api-key': api_key,
  };
  return HttpService.Magic.Post(endpoint, headers, body);
}
