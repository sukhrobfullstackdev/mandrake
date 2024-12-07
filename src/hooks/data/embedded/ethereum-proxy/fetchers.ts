import { Endpoint } from '@constants/endpoint';
import { GasPriceEstimationQueryKey } from '@hooks/data/embedded/ethereum-proxy/keys';
import { HttpService } from '@lib/http-services';
import { QueryFunction } from '@tanstack/react-query';

export type GasPriceEstimationResponse = {
  data: { estimatedPrices: { maxPriorityFeePerGas: string; maxFeePerGas: string }[] };
};

export const gasPriceEstimationFetch =
  (): QueryFunction<GasPriceEstimationResponse, GasPriceEstimationQueryKey> =>
  ({ queryKey: [, { authUserSessionToken }] }) => {
    const headers = {
      Authorization: `Bearer ${authUserSessionToken}`,
    };

    return HttpService.Magic.Get(Endpoint.Ethereum.GasPriceEstimation, headers);
  };
