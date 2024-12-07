import { Endpoint } from '@constants/endpoint';
import { ConfirmActionState } from '@hooks/data/embedded/confirm-action';
import { ConfirmActionPollerQueryKey } from '@hooks/data/embedded/confirm-action/keys';
import { HttpService } from '@http-services';
import { QueryFunction } from '@tanstack/react-query';

export const confirmActionStatusFetch =
  (): QueryFunction<ConfirmActionState, ConfirmActionPollerQueryKey> =>
  ({ queryKey: [, { authUserId, confirmationId }] }) => {
    const endpoint = `${Endpoint.ConfirmAction.Status}?auth_user_id=${authUserId}&confirmation_id=${confirmationId}`;
    return HttpService.Magic.Get(endpoint);
  };
