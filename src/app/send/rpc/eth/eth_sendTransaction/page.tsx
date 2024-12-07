'use client';

import { EVM_NETWORKS_BY_CHAIN_ID } from '@constants/chain-info';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { NodeError, useEthereumProxy } from '@hooks/common/ethereum-proxy';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useSendRouter } from '@hooks/common/send-router';
import { useClientConfigQuery } from '@hooks/data/embedded/magic-client';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { getRpcProvider } from '@lib/common/rpc-provider';
import { standardizePayload } from '@lib/ledger/evm/standardize-evm-payload';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';

import { AwsCredentialIdentity } from '@aws-sdk/types';
import { WalletInfo, WalletType } from '@custom-types/wallet';
import { getWalletInfoAndCredentials } from '@hooks/common/hydrate-or-create-wallets/wallet-info-and-credentials';
import { LoadingSpinner, Page } from '@magiclabs/ui-components';
import { TransactionRequest } from 'ethers';
import { useEffect } from 'react';
import { signTransactionForUser } from '@hooks/blockchain/ethereum/sign-transaction';

export default function EthSendTransactionPage() {
  const router = useSendRouter();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();

  const payloadParams = activeRpcPayload?.params?.[0];

  const { magicApiKey, decodedQueryParams, authUserId, authUserSessionToken } = useStore(state => state);
  const { sendRawTransaction } = useEthereumProxy();

  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();

  const { data: clientConfig, error: clientConfigError } = useClientConfigQuery(
    {
      magicApiKey: magicApiKey || decodedQueryParams.apiKey || '',
    },
    { enabled: !!magicApiKey || !!decodedQueryParams.apiKey },
  );
  const { isComplete: isHydrateSessionComplete, isError: isHydrateSessionError } = useHydrateSession();

  const sendHeadlessEthTransaction = async () => {
    if (!authUserId || !authUserSessionToken || !activeRpcPayload) return;

    let credentials: AwsCredentialIdentity;
    let walletInfoData: WalletInfo;
    try {
      const { awsCreds, walletInfoData: walletInfo } = await getWalletInfoAndCredentials({
        authUserId,
        authUserSessionToken,
        walletType: WalletType.ETH,
      });
      credentials = awsCreds;
      walletInfoData = walletInfo;
    } catch (err) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.WalletHydrationError);
      return;
    }

    const rpcProvider = getRpcProvider();
    const network = await rpcProvider.getNetwork().catch(err => {
      rejectActiveRpcRequest((err as NodeError).code, (err as NodeError).message);
      return;
    });

    if ((!network || !network.chainId) && clientConfig?.features?.isSendTransactionUiEnabled) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UnableToGetNetworkInfo);
      return;
    }
    const chainIdNumber = Number(network?.chainId);

    const networkInfo = EVM_NETWORKS_BY_CHAIN_ID[chainIdNumber];
    let standardizedTransactionPayload: TransactionRequest;
    if (networkInfo?.transactionFormat) {
      standardizedTransactionPayload = await standardizePayload[networkInfo.transactionFormat](
        activeRpcPayload,
        rpcProvider,
        chainIdNumber,
        walletInfoData?.publicAddress || '',
        networkInfo.maxDefaultGasLimit,
        networkInfo.minDefaultGasLimit,
      );
    } else {
      standardizedTransactionPayload = await standardizePayload.EVM(
        activeRpcPayload,
        rpcProvider,
        chainIdNumber,
        walletInfoData?.publicAddress || '',
        91000,
        21000,
      );
    }

    const rawTransaction = await signTransactionForUser(
      credentials,
      walletInfoData?.encryptedPrivateAddress,
      standardizedTransactionPayload,
    );

    return sendRawTransaction(rawTransaction);
  };

  useEffect(() => {
    if (clientConfigError) {
      logger.error('eth_sendTransaction - Error fetching client config', clientConfigError);
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.FailedToFetchConfig);
    }
  }, [clientConfigError]);

  // Show overlay immediately if send transaction UI is enabled
  useEffect(() => {
    if (clientConfig?.features?.isSendTransactionUiEnabled) {
      IFrameMessageService.showOverlay();
    }
  }, [clientConfig]);

  // Redirect after session hydration to the correct send transaction page based on the payload data
  useEffect(() => {
    const handleEthSendTransaction = async () => {
      if (isHydrateSessionError) {
        rejectActiveRpcRequest(RpcErrorCode.InvalidRequest, RpcErrorMessage.UserDeniedAccountAccess);
        return;
      }

      if (!clientConfig?.features?.isSendTransactionUiEnabled) {
        try {
          const result = await sendHeadlessEthTransaction();
          resolveActiveRpcRequest(result);
        } catch (err) {
          rejectActiveRpcRequest((err as NodeError).code, (err as NodeError).message);
          return;
        }
      } else if (!payloadParams.data) {
        router.replace('/send/rpc/eth/eth_sendTransaction/evm');
      } else if (payloadParams.data.startsWith('0xa9059cbb')) {
        router.replace('/send/rpc/eth/eth_sendTransaction/erc_20');
      } else {
        router.replace('/send/rpc/eth/eth_sendTransaction/evm');
      }
    };

    if (isHydrateSessionComplete && clientConfig) {
      handleEthSendTransaction();
    }
  }, [isHydrateSessionComplete, clientConfig]);

  return (
    <Page.Content>
      <LoadingSpinner size={36} strokeWidth={4} />
    </Page.Content>
  );
}
