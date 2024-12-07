'use client';

import { EVM_NETWORKS_BY_CHAIN_ID } from '@constants/chain-info';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { signTransactionForUser } from '@hooks/blockchain/ethereum/sign-transaction';
import { NodeError } from '@hooks/common/ethereum-proxy';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useClientConfigQuery } from '@hooks/data/embedded/magic-client';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { getRpcProvider } from '@lib/common/rpc-provider';
import { standardizePayload } from '@lib/ledger/evm/standardize-evm-payload';
import { Signature, Transaction, TransactionRequest } from 'ethers';
import { useEffect } from 'react';
import { getWalletInfoAndCredentials } from '@hooks/common/hydrate-or-create-wallets/wallet-info-and-credentials';
import { WalletType } from '@custom-types/wallet';

export default function EthSignTransactionPage() {
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const { magicApiKey, decodedQueryParams } = useStore(state => state);
  const { authUserId, authUserSessionToken } = useStore(state => state);

  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();

  const { data: clientConfig, error: clientConfigError } = useClientConfigQuery(
    {
      magicApiKey: magicApiKey || decodedQueryParams.apiKey || '',
    },
    { enabled: !!magicApiKey || !!decodedQueryParams.apiKey },
  );
  const { isComplete: isHydrateSessionComplete, isError: isHydrateSessionError } = useHydrateSession();

  const signHeadlessEthSignTransaction = async () => {
    if (!activeRpcPayload || !authUserId || !authUserSessionToken) return;
    const rpcProvider = getRpcProvider();
    const network = await rpcProvider.getNetwork().catch(err => {
      rejectActiveRpcRequest((err as NodeError).code, (err as NodeError).message);
      return;
    });

    if (!network || !network.chainId) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UnableToGetNetworkInfo);
      return;
    }
    const chainIdNumber = Number(network.chainId);
    const networkInfo = EVM_NETWORKS_BY_CHAIN_ID[chainIdNumber];

    try {
      const { awsCreds: credentials, walletInfoData } = await getWalletInfoAndCredentials({
        authUserId,
        authUserSessionToken,
        walletType: WalletType.ETH,
      });

      let standardizedTransactionPayload: TransactionRequest;
      if (networkInfo.transactionFormat) {
        standardizedTransactionPayload = await standardizePayload[networkInfo.transactionFormat](
          activeRpcPayload,
          rpcProvider,
          chainIdNumber,
          walletInfoData.publicAddress,
          networkInfo.maxDefaultGasLimit,
          networkInfo.minDefaultGasLimit,
        );
      } else {
        standardizedTransactionPayload = await standardizePayload.EVM(
          activeRpcPayload,
          rpcProvider,
          chainIdNumber,
          walletInfoData.publicAddress,
          networkInfo.maxDefaultGasLimit,
          networkInfo.minDefaultGasLimit,
        );
      }

      const signedTransaction = await signTransactionForUser(
        credentials,
        walletInfoData.encryptedPrivateAddress,
        standardizedTransactionPayload,
      );

      if (!signedTransaction) {
        rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserDeniedSigning);
        return;
      }

      const parsedTransaction = Transaction.from(signedTransaction);

      const { nonce, to, value, gasLimit, gasPrice, type, maxFeePerGas, maxPriorityFeePerGas } =
        standardizedTransactionPayload;
      const { v, r, s } = parsedTransaction.signature as Signature;
      const { hash } = parsedTransaction;
      const result = {
        raw: signedTransaction,
        tx: {
          nonce,
          to,
          value,
          v,
          r,
          s,
          hash,
          gasLimit,
          ...(Number(type) === 2
            ? {
                maxFeePerGas,
                maxPriorityFeePerGas,
              }
            : {
                gasPrice,
              }),
        },
      };

      return result;
    } catch (e) {
      logger.error('eth_signTransaction - Error signing transaction', e);
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.FailedToSignTransaction);
    }
  };

  useEffect(() => {
    if (clientConfigError) {
      logger.error('eth_signTransaction - Error fetching client config', clientConfigError);
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.FailedToFetchConfig);
    }
  }, [clientConfigError]);

  useEffect(() => {
    const handleEthSignTransaction = async () => {
      if (isHydrateSessionError) {
        rejectActiveRpcRequest(RpcErrorCode.InvalidRequest, RpcErrorMessage.UserDeniedAccountAccess);
        return;
      }
      const signedTransaction = await signHeadlessEthSignTransaction();
      resolveActiveRpcRequest(signedTransaction);
    };

    if (isHydrateSessionComplete) {
      handleEthSignTransaction();
    }
  }, [isHydrateSessionComplete, clientConfig]);

  return null;
}
