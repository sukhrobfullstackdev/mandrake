import { Endpoint } from '@constants/endpoint';
import { confirmActionStatusFetch } from '@hooks/data/embedded/confirm-action/fetchers';
import {
  ConfirmActionPollerParams,
  ConfirmActionPollerQueryKey,
  confirmActionQueryKeys,
} from '@hooks/data/embedded/confirm-action/keys';
import { HttpService } from '@lib/http-services';
import { UseQueryOptions, UseQueryResult, useMutation, useQuery } from '@tanstack/react-query';

export type TransactionType = undefined | 'eth-transfer' | 'token-transfer' | 'flow-usdc-transfer' | 'erc20-transfer';

export const ETH_TRANSFER = 'eth-transfer';
export const TOKEN_TRANSFER = 'token-transfer';
export const FLOW_USDC_TRANSFER = 'flow-usdc-transfer';
export const ERC20_TRANSFER = 'erc20-transfer';

export interface ConfirmActionInfo {
  amount?: string;
  token?: string;
  signer?: string;
  fiat_value?: string;
  token_amount?: string;
  symbol?: string;
  network_label?: string;
  transaction_type?: TransactionType;
  chain_info_uri?: string;
  message?: string; // string (JSON stringified object)
  request_domain?: string;
  nft?: {
    contract_address: string;
    token_id: string;
    token_type: string;
    quantity: number;
  };
  estimatedGasFee?: string;
  email?: string;
  appName?: string;
  // transaction info
  from?: string;
  to?: string;
  value?: string;
  data?: string;

  // chain info
  walletType?: string;
  chainId?: string;

  // magic specific
  networkFee?: string;
  tokenPrice?: string;
  freeTransactionCount?: number; // stability only
}

export enum ConfirmActionType {
  SendTransaction = 'SEND_TRANSACTION',
  TransferTransaction = 'TRANSFER_TRANSACTION',
  SignMessage = 'SIGN_MESSAGE',
  SignTransaction = 'SIGN_TRANSACTION',
  ConfirmTransaction = 'CONFIRM_TRANSACTION',
}

interface UseBeginConfirmActionParams {
  authUserId: string;
  action: ConfirmActionType;
  payload: ConfirmActionInfo;
}

interface BeginConfirmActionBody {
  auth_user_id: string;
  action: ConfirmActionType;
  payload: ConfirmActionInfo;
}

type BeginConfirmActionResponse = {
  confirmationId: string;
  temporaryConfirmationToken: string;
};

export const useBeginConfirmActionQuery = () => {
  return useMutation({
    mutationFn: (params: UseBeginConfirmActionParams): Promise<BeginConfirmActionResponse> => {
      const { authUserId, action, payload } = params;
      const body: BeginConfirmActionBody = {
        auth_user_id: authUserId,
        action,
        payload,
      };
      const endpoint = Endpoint.ConfirmAction.Begin;
      return HttpService.Magic.Post(endpoint, {}, body);
    },
    gcTime: 1000,
  });
};

export type ConfirmActionState = { status: 'APPROVED' | 'REJECTED' | 'PENDING' | 'EXPIRED' };
export const useConfirmActionStatusPollerQuery = (
  params: ConfirmActionPollerParams,
  config?: Omit<
    UseQueryOptions<ConfirmActionState, Error, ConfirmActionState, ConfirmActionPollerQueryKey>,
    'queryKey' | 'queryFn'
  >,
): UseQueryResult<ConfirmActionState> =>
  useQuery({
    queryKey: confirmActionQueryKeys.status(params),
    queryFn: confirmActionStatusFetch(),
    ...config,
  });
