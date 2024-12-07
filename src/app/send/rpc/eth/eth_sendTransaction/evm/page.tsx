/* istanbul ignore file */

'use client';

import InsufficientBalanceAlert from '@app/send/rpc/eth/eth_sendTransaction/__components__/insufficient-balance-alert';
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
import { useChainInfo } from '@hooks/common/chain-info';
import { useClientConfigFeatureFlags } from '@hooks/common/client-config';
import { useConfirmAction } from '@hooks/common/confirm-action';
import { NodeError, useEthereumProxy } from '@hooks/common/ethereum-proxy';
import { getWalletInfoAndCredentials } from '@hooks/common/hydrate-or-create-wallets/wallet-info-and-credentials';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import usePayloadOverride from '@hooks/common/payload-override';
import { useSendRouter } from '@hooks/common/send-router';
import { useNativeTokenPrice } from '@hooks/common/token';
import { useUserMetadata } from '@hooks/common/user-metadata';
import { ConfirmActionType, ETH_TRANSFER } from '@hooks/data/embedded/confirm-action';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { useTranslation } from '@lib/common/i18n';
import { getRpcProvider } from '@lib/common/rpc-provider';
import { EVMTransactionService } from '@lib/ledger/evm-transaction-services';
import { standardizePayload } from '@lib/ledger/evm/standardize-evm-payload';
import { isGreaterThan, subtract } from '@lib/ledger/evm/utils/bn-math';
import { getBaseAnalyticsProperties } from '@lib/message-channel/event-helper';
import { resolveJsonRpcResponse } from '@lib/message-channel/resolve-json-rpc-response';
import { isStabilityProtocol } from '@lib/utils/stability-protocol';
import { TransactionAmounts } from '@lib/utils/transaction-utils';
import { JsonRpcRequestPayload } from '@magic-sdk/types';
import { Button, Page, Text } from '@magiclabs/ui-components';
import { Box, Spacer, VStack } from '@styled/jsx';
import { TransactionRequest, formatUnits, getBigInt } from 'ethers';
import { useSearchParams } from 'next/navigation';
import { useEffect, useLayoutEffect, useState } from 'react';
import { signTransactionForUser } from '@hooks/blockchain/ethereum/sign-transaction';

export default function EthSendTransactionEvm() {
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const { getRpcPayloadOverride } = usePayloadOverride();
  const searchParams = useSearchParams();
  const txFromUrl = JSON.parse(searchParams.get('txObject') || '{}');
  const { userMetadata } = useUserMetadata();
  const { chainInfo } = useChainInfo();
  const { tokenPriceData } = useNativeTokenPrice();
  const { getBalance, sendRawTransaction } = useEthereumProxy();
  const [hasEnoughFunds, setHasEnoughFunds] = useState<boolean>(true);
  const { t } = useTranslation('send');
  const TransactionService = new EVMTransactionService(userMetadata?.publicAddress || '');
  const [transactionAmounts, setTransactionAmounts] = useState<undefined | TransactionAmounts>();
  const [balance, setBalance] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState('');
  const router = useSendRouter();
  const isSendButtonEnabled = activeRpcPayload && userMetadata && transactionAmounts && hasEnoughFunds;
  const [disabled, setDisabled] = useState<boolean>(false);
  const { sdkMetaData, authUserId, authUserSessionToken } = useStore(state => state);
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const isStabilityTransaction = isStabilityProtocol();
  const features = useClientConfigFeatureFlags();

  const { doConfirmActionIfRequired, isActionConfirmed, isActionConfirmationExpired, isSkipConfirmAction } =
    useConfirmAction();

  useLayoutEffect(() => {
    if (!userMetadata?.publicAddress || !chainInfo) return;
    getBalance(userMetadata.publicAddress).then(res => {
      setBalance(res);
    });
  }, [userMetadata, chainInfo]);

  const handleSendEthTransaction = async () => {
    if (!authUserId || !authUserSessionToken) return;

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
            amount: formatUnits(transactionAmounts?.transactionValue || '0'),
            fiat_value: transactionAmounts?.transactionValueInFiat.toString(),
            transaction_type: ETH_TRANSFER,
            token: chainInfo?.currency || WalletType.ETH,
            to: activeRpcPayload?.params[0]?.to || '',
            from: userMetadata?.publicAddress || '',
          },
        });
        return;
      }
    } catch (err) {
      logger.error('Error getting wallet info and credential', err);
      setDisabled(false);
      setErrorMessage(t('An error occurred. Please try again.'));
      return;
    }

    try {
      if (!transactionAmounts || !activeRpcPayload || !userMetadata?.publicAddress) return;
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
      if (networkInfo.transactionFormat) {
        standardizedTransactionPayload = await standardizePayload[networkInfo.transactionFormat](
          activeRpcPayload.method === 'magic_wallet'
            ? getRpcPayloadOverride(userMetadata.publicAddress)
            : activeRpcPayload,
          rpcProvider,
          chainIdNumber,
          walletInfoData.publicAddress || '',
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
          walletInfoData.publicAddress,
          91000,
          21000,
        );
      }

      const rawTransaction = await signTransactionForUser(
        credentials,
        walletInfoData.encryptedPrivateAddress,
        standardizedTransactionPayload,
      );
      const hash = await sendRawTransaction(rawTransaction);
      if (!hash) return;
      // Resolve payload with hash to developer before closing our UI
      if (activeRpcPayload.method === ETH_SENDTRANSACTION) {
        resolveJsonRpcResponse({
          payload: activeRpcPayload,
          sdkMetadata: sdkMetaData || {},
          analyticsProperties: getBaseAnalyticsProperties(),
          result: hash,
        });
      }
      const params = `transactionType=${encodeURIComponent(ETH_TRANSFER)}&transactionValueInFiat=${encodeURIComponent(transactionAmounts.transactionValueInFiat.toString())}&to=${encodeURIComponent(activeRpcPayload.params[0]?.to || txFromUrl.to)}&from=${encodeURIComponent(userMetadata.publicAddress)}&hash=${encodeURIComponent(hash)}`;
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
      activeRpcPayload.params[0]?.value || txFromUrl.value,
      tokenPriceData.toCurrencyAmountDisplay,
      activeRpcPayload.method === 'magic_wallet'
        ? ({
            params: [
              {
                to: txFromUrl.to,
                from: userMetadata.publicAddress,
                value: txFromUrl.value,
                data: txFromUrl.data,
              },
            ],
          } as JsonRpcRequestPayload)
        : activeRpcPayload,
    ).then(setTransactionAmounts);
  }, [userMetadata, tokenPriceData]);

  // check if user has enough funds
  useLayoutEffect(() => {
    if (!transactionAmounts || balance === undefined || !tokenPriceData) return;
    const { total } = transactionAmounts;
    if (isGreaterThan(total, balance)) {
      return setHasEnoughFunds(false);
    }
  }, [transactionAmounts, balance, tokenPriceData]);

  useEffect(() => {
    if (isActionConfirmed || isSkipConfirmAction) handleSendEthTransaction();
    if (isActionConfirmationExpired) setDisabled(false);
  }, [isActionConfirmed, isActionConfirmationExpired, isSkipConfirmAction]);

  return (
    <Page.Content>
      <WalletBalanceBanner />
      <SendTxTokenLogo />
      <TransactionSendAmount type={ETH_TRANSFER} value={transactionAmounts?.transactionValueInFiat} />
      <Spacer size="8" />
      <TransactionToFromAddresses
        from={userMetadata?.publicAddress || ''}
        to={activeRpcPayload?.params[0]?.to || txFromUrl?.to || ''}
      />
      <Box w="100%" maxW={'25rem'} m={'1.2rem 0'}>
        {isStabilityTransaction ? null : (
          <TransactionLineItems
            amountWei={transactionAmounts?.transactionValue.toString() || ''}
            amountUsd={transactionAmounts?.transactionValueInFiat.toString() || ''}
            networkFeeWei={transactionAmounts?.networkFee.toString() || ''}
            networkFeeUsd={transactionAmounts?.networkFeeInFiat.toString() || ''}
            totalWei={transactionAmounts?.total.toString() || ''}
            totalUsd={transactionAmounts?.totalInFiat.toString() || ''}
            insufficientFunds={!hasEnoughFunds}
          />
        )}
      </Box>
      {errorMessage && (
        <VStack>
          <Text variant="error">{errorMessage}</Text>
          <Spacer size="4" />
        </VStack>
      )}
      <Box w="100%" maxW={'25rem'}>
        {hasEnoughFunds ? (
          <Button
            expand
            disabled={disabled || !isSendButtonEnabled}
            validating={disabled}
            onPress={handleSendEthTransaction}
            label={t('Send')}
          />
        ) : null}
        {transactionAmounts && tokenPriceData && !hasEnoughFunds ? (
          <InsufficientBalanceAlert
            amountInWei={subtract(transactionAmounts.total, getBigInt(balance || '0'))}
            token={chainInfo?.currency || WalletType.ETH}
            price={tokenPriceData.toCurrencyAmountDisplay}
          />
        ) : null}
      </Box>
    </Page.Content>
  );
}
