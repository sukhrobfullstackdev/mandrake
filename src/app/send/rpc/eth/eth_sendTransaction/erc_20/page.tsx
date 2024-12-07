/* istanbul ignore file */

'use client';

import SendTxTokenLogo from '@app/send/rpc/eth/eth_sendTransaction/__components__/send-tx-token-logo';
import TransactionLineItems from '@app/send/rpc/eth/eth_sendTransaction/__components__/transaction-line-items';
import TransactionSendAmount from '@app/send/rpc/eth/eth_sendTransaction/__components__/transaction-send-amount';
import TransactionToFromAddresses from '@app/send/rpc/eth/eth_sendTransaction/__components__/transaction-to-from-addresses';
import WalletBalanceBanner from '@app/send/rpc/eth/eth_sendTransaction/__components__/wallet-balance-banner';
import { AwsCredentialIdentity } from '@aws-sdk/types';
import { EVM_NETWORKS_BY_CHAIN_ID } from '@constants/chain-info';
import { ETH_SENDTRANSACTION } from '@constants/eth-rpc-methods';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { WalletInfo, WalletType } from '@custom-types/wallet';
import { useClientConfigFeatureFlags } from '@hooks/common/client-config';
import { useConfirmAction } from '@hooks/common/confirm-action';
import { NodeError, useEthereumProxy } from '@hooks/common/ethereum-proxy';
import { getWalletInfoAndCredentials } from '@hooks/common/hydrate-or-create-wallets/wallet-info-and-credentials';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import usePayloadOverride from '@hooks/common/payload-override';
import { useSendRouter } from '@hooks/common/send-router';
import { useNativeTokenPrice } from '@hooks/common/token';
import { useUserMetadata } from '@hooks/common/user-metadata';
import { ConfirmActionType, ERC20_TRANSFER } from '@hooks/data/embedded/confirm-action';
import { StoreState, useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { useTranslation } from '@lib/common/i18n';
import { getRpcProvider } from '@lib/common/rpc-provider';
import { EVMTransactionService } from '@lib/ledger/evm-transaction-services';
import { standardizePayload } from '@lib/ledger/evm/standardize-evm-payload';
import { getBaseAnalyticsProperties } from '@lib/message-channel/event-helper';
import { resolveJsonRpcResponse } from '@lib/message-channel/resolve-json-rpc-response';
import {
  Erc20TokenTransferDetailsType,
  getTokenTransferDetails,
  TransactionAmounts,
} from '@lib/utils/transaction-utils';
import { Button, Page, Text } from '@magiclabs/ui-components';
import { Box, Spacer, VStack } from '@styled/jsx';
import { TransactionRequest } from 'ethers';
import { useEffect, useLayoutEffect, useState } from 'react';
import { signTransactionForUser } from '@hooks/blockchain/ethereum/sign-transaction';

export default function EthSendTransactionErc20() {
  const { t } = useTranslation('send');
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const { getRpcPayloadOverride } = usePayloadOverride();
  const { userMetadata } = useUserMetadata();
  const { tokenPriceData } = useNativeTokenPrice();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const { sdkMetaData, authUserId, authUserSessionToken } = useStore((state: StoreState) => state);
  const { sendRawTransaction } = useEthereumProxy();
  const TransactionService = new EVMTransactionService(userMetadata?.publicAddress || '');
  const [transactionAmounts, setTransactionAmounts] = useState<undefined | TransactionAmounts>();
  const [tokenTransferDetails, setTokenTransferDetails] = useState<Erc20TokenTransferDetailsType>();
  const router = useSendRouter();
  const isSendButtonEnabled = activeRpcPayload && userMetadata && transactionAmounts; // && hasEnoughFunds;
  const [disabled, setDisabled] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState('');
  const features = useClientConfigFeatureFlags();

  const { doConfirmActionIfRequired, isActionConfirmed, isActionConfirmationExpired, isSkipConfirmAction } =
    useConfirmAction();

  const handleSendEthTransaction = async () => {
    if (!authUserId || !authUserSessionToken || !activeRpcPayload) return;

    setDisabled(true);
    setErrorMessage('');

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
      if (features?.isSigningUiEnabled && !isActionConfirmed && !isSkipConfirmAction) {
        doConfirmActionIfRequired({
          action: ConfirmActionType.SendTransaction,
          payload: {
            token_amount: tokenTransferDetails?.amount,
            transaction_type: ERC20_TRANSFER,
            to: tokenTransferDetails?.to,
            from: userMetadata?.publicAddress || '',
            symbol: tokenTransferDetails?.symbol,
          },
        });
        return;
      }
    } catch (err) {
      logger.error('Error getting wallet info and credential', err);
      setErrorMessage(t('An error occurred. Please try again.'));
      setDisabled(false);
      return;
    }

    try {
      setDisabled(true);
      if (!transactionAmounts || !userMetadata?.publicAddress) return;
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
      let standardizedTransactionPayload: TransactionRequest;
      if (networkInfo?.transactionFormat) {
        standardizedTransactionPayload = await standardizePayload[networkInfo.transactionFormat](
          activeRpcPayload.method === 'magic_wallet'
            ? getRpcPayloadOverride(userMetadata.publicAddress)
            : activeRpcPayload,
          rpcProvider,
          chainIdNumber,
          walletInfoData?.publicAddress || '',
          networkInfo.maxDefaultGasLimit,
          networkInfo.minDefaultGasLimit,
        );
      } else {
        standardizedTransactionPayload = await standardizePayload.EVM(
          activeRpcPayload.method === 'magic_wallet'
            ? getRpcPayloadOverride(userMetadata.publicAddress)
            : activeRpcPayload,
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
      const hash = await sendRawTransaction(rawTransaction);
      if (!hash) return;
      // Resolve payload with hash to developer before closing our UI
      if (activeRpcPayload.method === ETH_SENDTRANSACTION) {
        resolveJsonRpcResponse({
          payload: activeRpcPayload,
          analyticsProperties: getBaseAnalyticsProperties(),
          sdkMetadata: sdkMetaData || {},
          result: hash,
        });
      }
      const params = `transactionType=${encodeURIComponent(ERC20_TRANSFER)}
      &amount=${encodeURIComponent(tokenTransferDetails?.amount.toString() || '')}
      &to=${encodeURIComponent(tokenTransferDetails?.to || '')}
      &symbol=${encodeURIComponent(tokenTransferDetails?.symbol || '')}
      &from=${encodeURIComponent(userMetadata.publicAddress)}
      &hash=${encodeURIComponent(hash)}`;
      router.replace(`/send/rpc/eth/eth_sendTransaction/pending_transaction?${params}`);
    } catch (error) {
      logger.error('Error sending transaction', error);
      rejectActiveRpcRequest((error as NodeError).code, (error as NodeError).message);
      return;
    }
  };

  // calculate transaction amounts
  useLayoutEffect(() => {
    if (!activeRpcPayload || !userMetadata?.publicAddress || !tokenPriceData) return;
    TransactionService.calculateTransactionAmounts(
      activeRpcPayload.params[0]?.value || '0',
      tokenPriceData.toCurrencyAmountDisplay,
      activeRpcPayload.method === 'magic_wallet' ? getRpcPayloadOverride(userMetadata.publicAddress) : activeRpcPayload,
    ).then(setTransactionAmounts);
  }, [userMetadata, tokenPriceData]);

  useLayoutEffect(() => {
    if (!activeRpcPayload || !userMetadata?.publicAddress) return;
    const payload =
      activeRpcPayload.method === 'magic_wallet'
        ? getRpcPayloadOverride(userMetadata.publicAddress).params[0]
        : activeRpcPayload.params[0];
    getTokenTransferDetails(payload).then(setTokenTransferDetails);
  }, [userMetadata]);

  useEffect(() => {
    if (isActionConfirmed || isSkipConfirmAction) handleSendEthTransaction();
    if (isActionConfirmationExpired) setDisabled(false);
  }, [isActionConfirmed, isActionConfirmationExpired, isSkipConfirmAction]);

  return (
    <Page.Content>
      <WalletBalanceBanner />
      <SendTxTokenLogo isErc20Token />
      <TransactionSendAmount
        type={ERC20_TRANSFER}
        symbol={tokenTransferDetails?.symbol}
        amount={tokenTransferDetails?.amount}
      />
      <Spacer size="8" />
      <TransactionToFromAddresses
        from={userMetadata?.publicAddress || ''}
        to={tokenTransferDetails?.to || ''}
        isErc20Transfer
      />
      <Box w="100%" maxW={'25rem'} m={'1.2rem 0'}>
        <TransactionLineItems
          amountWei={''}
          amountUsd={''}
          networkFeeWei={transactionAmounts?.networkFee.toString() || ''}
          networkFeeUsd={transactionAmounts?.networkFeeInFiat.toString() || ''}
          totalWei={''}
          totalUsd={''}
          isErc20Transfer
        />
      </Box>
      {errorMessage && (
        <VStack>
          <Text variant="error">{errorMessage}</Text>
          <Spacer size="4" />
        </VStack>
      )}
      <Box w="100%" maxW={'25rem'}>
        {isSendButtonEnabled ? (
          <Button
            expand
            validating={disabled}
            disabled={disabled}
            onPress={handleSendEthTransaction}
            label={t('Send')}
          />
        ) : null}
      </Box>
    </Page.Content>
  );
}
