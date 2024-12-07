'use client';

import { AwsCredentialIdentity } from '@aws-sdk/types';
import { normalizeTypedData } from '@components/sign-typed-data/sign-typed-data-page';
import { RpcErrorMessage } from '@constants/json-rpc';
import { WalletInfo } from '@custom-types/wallet';
import { useClientConfigFeatureFlags, useClientId } from '@hooks/common/client-config';
import { useSubmitGaslessTransactionMutation } from '@hooks/data/embedded/gasless-transactions';
import { DkmsService } from '@lib/dkms';
import { buildForwardPayload } from '@lib/utils/gasless-transactions';
import Web3Service from '@lib/utils/web3-services/web3-service';
import { JsonRpcRequestPayload } from '@magic-sdk/types';
import { EIP712TypedData } from 'eth-sig-util';
import { TransactionRequest } from 'ethers';

export interface SendGaslessTransactionProps {
  publicAddress: string;
  activeRpcPayload: JsonRpcRequestPayload;
  credentialsData: AwsCredentialIdentity;
  walletInfoData: WalletInfo;
}

export function useGaslessTransaction() {
  const features = useClientConfigFeatureFlags();
  const { clientId, error: clientIdError } = useClientId();
  const { mutateAsync: mutateSubmitGaslessTransaction } = useSubmitGaslessTransactionMutation();

  const handleSignTypedData = async (
    typedData: EIP712TypedData,
    credentialsData: AwsCredentialIdentity,
    walletInfoData: WalletInfo,
  ) => {
    const pk = await DkmsService.reconstructSecret(credentialsData, walletInfoData.encryptedPrivateAddress);
    return Web3Service.signTypedDataV4(normalizeTypedData(typedData), pk);
  };

  const sendGaslessTransaction = async ({
    activeRpcPayload,
    publicAddress,
    credentialsData,
    walletInfoData,
  }: SendGaslessTransactionProps) => {
    if (!features?.isGaslessTransactionsEnabled) {
      throw new Error(RpcErrorMessage.GaslessTransactionsNotEnabled);
    }

    const [signerAddress, transaction] = activeRpcPayload.params as [string, TransactionRequest];
    if (typeof signerAddress !== 'string') {
      throw new Error('Missing parameter: address');
    }

    if (!(await Web3Service.compareAddresses([signerAddress, publicAddress]))) {
      throw new Error('Signer address does not match logged in user');
    }

    const typedDataV4Payload = await buildForwardPayload(signerAddress, transaction);
    const signature = await handleSignTypedData(typedDataV4Payload, credentialsData, walletInfoData);

    return mutateSubmitGaslessTransaction({
      address: signerAddress,
      payload: typedDataV4Payload,
      signedTransaction: signature,
      clientId,
    });
  };

  return { sendGaslessTransaction, clientIdError };
}
