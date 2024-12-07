/* istanbul ignore file */

'use client';

import { PassportPageErrorCodes } from '@constants/passport-page-errors';
import { PASSPORT_ERROR_URL } from '@constants/routes';
import { usePassportRouter } from '@hooks/common/passport-router';
import { usePassportStore } from '@hooks/data/passport/store';
import { PopupAtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { classifyUserOperation, UserOperationType } from '@lib/utils/rpc-calls';
import { LoadingSpinner } from '@magiclabs/ui-components';
import { Center } from '@styled/jsx';
import { useEffect } from 'react';

export default function SendUserOperation() {
  const router = usePassportRouter();
  const popupPayload = PopupAtomicRpcPayloadService.getActiveRpcPayload();
  const { accessToken, eoaPublicAddress } = usePassportStore.getState();

  useEffect(() => {
    if (!accessToken || !eoaPublicAddress) {
      return router.push(PASSPORT_ERROR_URL(PassportPageErrorCodes.USER_SESSION_NOT_FOUND));
    }

    const sendUserOpParams = popupPayload?.params;
    if (!sendUserOpParams) return;
    const routePayload = async () => {
      // parse + add send userop call data / calls validation logic
      // ie reject when we get something we're not expecting.
      // aside from approve + mint with usdc, we should only have 1 call per send user op.
      const classifiedUserOperation = await classifyUserOperation(sendUserOpParams);
      if (classifiedUserOperation === UserOperationType.NFTMint) {
        router.push('/passport/rpc/eth/eth_sendUserOperation/nft_mint');
      } else if (classifiedUserOperation === UserOperationType.NativeTokenTransfer) {
        router.push('/passport/rpc/eth/eth_sendUserOperation/send_native_gas_tokens');
      } else {
        router.push('/passport/rpc/eth/eth_sendUserOperation/generic_user_op');
      }
    };
    routePayload();
  }, []);

  return (
    <Center mt="36vh">
      <LoadingSpinner size={56} strokeWidth={6} neutral />
    </Center>
  );
}
