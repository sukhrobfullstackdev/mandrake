/* istanbul ignore file */

import { useNftCheckoutContext } from '@app/send/rpc/nft/magic_nft_checkout/nft-checkout-context';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { NFT_CHECKOUT_STATUS } from '@constants/nft';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';

export const useCloseNftCheckout = () => {
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const { setStatus, status } = useNftCheckoutContext();

  const closeNftCheckout = () => {
    if (status === NFT_CHECKOUT_STATUS.HYDRATE_SESSION) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, 'Failed to hydrate session');
    } else if (status === NFT_CHECKOUT_STATUS.NOW_AVAILABLE) {
      resolveActiveRpcRequest({ status: 'processed' });
    } else if (status === NFT_CHECKOUT_STATUS.ITEM_SOLD_OUT) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, 'Item is sold out');
    } else if (status === NFT_CHECKOUT_STATUS.PRE_SALE_SOLD_OUT) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, 'Pre-sale is sold out');
    } else {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserCanceledAction, undefined, {
        closedByUser: true,
      });
    }

    // reset status
    setStatus(NFT_CHECKOUT_STATUS.HYDRATE_SESSION);
  };

  return { closeNftCheckout };
};
