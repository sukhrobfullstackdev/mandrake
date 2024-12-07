import { Endpoint } from '@constants/endpoint';
import { HttpService } from '@http-services';
import { useMutation } from '@tanstack/react-query';

interface TrackRevealWalletBody {
  auth_user_id: string;
  are_consequences_ack?: boolean;
  export_reason?: string;
  is_backup?: boolean;
}

export const useTrackRevealWalletQuery = () => {
  return useMutation({
    mutationFn: ({
      auth_user_id,
      are_consequences_ack = true,
      export_reason = '',
      is_backup = true,
    }: TrackRevealWalletBody) => {
      return HttpService.Magic.Post(
        Endpoint.Wallet.Export,
        {},
        { auth_user_id, are_consequences_ack, export_reason, is_backup },
      );
    },
  });
};
