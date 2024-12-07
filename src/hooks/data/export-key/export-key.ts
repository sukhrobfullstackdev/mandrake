import { Endpoint } from '@constants/endpoint';
import { HttpService } from '@http-services';
import { useMutation } from '@tanstack/react-query';

export interface ExportPrivateKeyBody {
  encryption_context: string;

  access_key: string;

  wallet_id: string;

  rsa_public_key: string;

  export_request_id: string;

  payload: string[];
}

export const useExportPrivateKey = () => {
  return useMutation({
    mutationFn: (payload: ExportPrivateKeyBody) => {
      return HttpService.MagicApiWallet.Post(Endpoint.MagicApiWallet.RevealPK, {}, payload);
    },
  });
};
