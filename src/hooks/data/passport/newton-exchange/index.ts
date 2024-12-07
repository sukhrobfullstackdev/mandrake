import { Endpoint } from '@constants/endpoint';
import { HttpService } from '@lib/http-services';
import { useMutation } from '@tanstack/react-query';
import { Hex } from 'magic-passport/types';

export function useCheckRateLimitStatusMutation() {
  return useMutation({
    mutationFn: (): Promise<unknown> => {
      return HttpService.NewtonExchange.Get(Endpoint.NewtonExchange.RateLimitStatus);
    },
    gcTime: 1000,
  });
}

interface ConvertResponse {
  transactionId: string;
  timestamp: string;
}
interface ConvertParams {
  wallet_address: Hex;
  input_transaction_id: Hex;
  input_chain_id: string;
  value: string;
}

export function useConvertMutation() {
  return useMutation({
    mutationFn: (body: ConvertParams): Promise<ConvertResponse> => {
      return HttpService.NewtonExchange.Post(Endpoint.NewtonExchange.Convert, {}, body);
    },
    gcTime: 1000,
  });
}
