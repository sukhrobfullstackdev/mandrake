import { Endpoint } from '@constants/endpoint';
import { HttpService } from '@lib/http-services';
import { useMutation } from '@tanstack/react-query';

interface AssociateUserWithPublicAddressResponse {
  publicAddress: string;
}

export interface AssociateUserWithPublicAddressParams {
  publicAddress: string;
}

export function useAssociateUserWithPublicAddressMutation() {
  return useMutation({
    mutationFn: ({
      publicAddress,
    }: AssociateUserWithPublicAddressParams): Promise<AssociateUserWithPublicAddressResponse> => {
      return HttpService.PassportIdentity.Patch(
        Endpoint.PassportIdentity.PassportUser,
        {},
        { public_address: publicAddress },
      );
    },
    gcTime: 1000,
  });
}
