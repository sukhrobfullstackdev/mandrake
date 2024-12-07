import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { RPCErrorCode } from '@magic-sdk/types';
import { UnknownRecord } from 'type-fest';

export const useHandleRejectActiveRpcRequest = () => {
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();

  const handleRejectActiveRpcRequest = (
    error: string,
    errorCode: string | number = RPCErrorCode.InvalidRequest,
    errorMeta: UnknownRecord = {},
  ) => {
    logger.error(error, {
      errorCode,
      ...errorMeta,
    });

    rejectActiveRpcRequest(errorCode, error);
  };

  return { handleRejectActiveRpcRequest };
};
