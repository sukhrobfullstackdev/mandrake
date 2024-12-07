import { getCustomNonce } from '@app/passport/libs/nonce';
import KernelClientService from '@app/passport/libs/tee/kernel-client';
import { KernelClientCallData } from '@custom-types/passport';
import { usePassportStore } from '@hooks/data/passport/store';
import { PassportSmartAccount } from '@hooks/passport/use-smart-account';
export const useDoSendUserOperation = () => {
  const { decodedQueryParams, eoaPublicAddress, accessToken } = usePassportStore(state => state);
  const network = decodedQueryParams.network;
  const doSendUserOperation = async (
    smartAccount: PassportSmartAccount,
    operation: KernelClientCallData[],
    isCabClientOperation: boolean = true,
  ) => {
    if (!network) throw new Error('No network found in query params');
    if (!eoaPublicAddress) throw new Error('No public address found in query params');
    if (!accessToken) throw new Error('No access token found in query params');
    if (!smartAccount) throw new Error('doSendUserOperation: Smart account not found');

    let userOpHash;

    if (isCabClientOperation) {
      logger.info('using cab client');
      const { cabClient } = KernelClientService.getCABKernelClient({ smartAccount, network });

      if (!cabClient) throw new Error('doSendUserOperation: CAB client not found');
      const { userOperation } = await cabClient.prepareUserOperationRequestCAB({
        calls: operation,
        repayTokens: ['6TEST'],
        userOperation: { nonce: await getCustomNonce(smartAccount) },
      });
      userOpHash = await cabClient.sendUserOperationCAB({ userOperation });
    } else {
      logger.info('not using cab client');
      const kernelClient = KernelClientService.getSingleChainKernelClient({ smartAccount, network });
      if (!kernelClient) throw new Error('doSendUserOperation: kernel client not found');
      const userOperation = await kernelClient.prepareUserOperationRequest({
        userOperation: {
          callData: await smartAccount.encodeCallData(operation),
          nonce: await getCustomNonce(smartAccount),
        },
        account: kernelClient.account,
      });
      userOpHash = await kernelClient.sendUserOperation({ userOperation });
    }
    return userOpHash;
  };
  return { doSendUserOperation };
};
