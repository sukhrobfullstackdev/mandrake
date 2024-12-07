/* istanbul ignore file */

'use client';

import TokenSelectionDrawer from '@app/passport/components/token-selection-drawer/token-selection-drawer';
import { formatDataField, getTotalValueInWei } from '@app/passport/libs/format_data_field';
import { NftImagePreview } from '@app/passport/rpc/eth/(components)/nft-image';
import TransactionToAddress from '@app/passport/rpc/eth/(components)/to-address-details';
import TransactionCancelButton from '@app/passport/rpc/eth/(components)/transaction-cancel-btn';
import TransactionConfirmButton from '@app/passport/rpc/eth/(components)/transaction-confirm-btn';
import TransactionHeader from '@app/passport/rpc/eth/(components)/transaction-header';
import TransactionNetworkFee from '@app/passport/rpc/eth/(components)/transaction-network-fee';
import TransactionSendAmount from '@app/passport/rpc/eth/(components)/transaction-send-amount';
import PassportLoadingSpinner from '@app/passport/rpc/user/components/passport-loading-spinner';
import { PassportTransactionStatus } from '@app/passport/rpc/user/components/passport-transaction-status';
import { PassportPageErrorCodes } from '@constants/passport-page-errors';
import { PASSPORT_ERROR_URL } from '@constants/routes';
import { KernelClientCallData } from '@custom-types/passport';
import { usePassportRouter } from '@hooks/common/passport-router';
import { resolvePopupRequest } from '@hooks/common/popup/popup-json-rpc-request';
import { usePassportAppConfig } from '@hooks/data/passport/app-config';
import { usePassportStore } from '@hooks/data/passport/store';
import { useUsdcBalance } from '@hooks/passport/token';
import { CEX_SUPPORTED_NETWORK_IDS, useCEX } from '@hooks/passport/use-cex';
import { useCheckBalance } from '@hooks/passport/use-check-balance';
import { useEstimateNetworkFee } from '@hooks/passport/use-estimate-network-fee';
import { useNFTMetadata } from '@hooks/passport/use-nft-metadata';
import { useDoSendUserOperation } from '@hooks/passport/use-send-user-operation';
import { useSmartAccount } from '@hooks/passport/use-smart-account';
import { useUserOperationValue } from '@hooks/passport/use-user-operation-value';
import { PopupAtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { useTranslation } from '@lib/common/i18n';
import { getCallsFromParams } from '@lib/utils/rpc-calls';
import { DrawerTokenMetadata, getDrawerTokens, getNativeTokenMetadata, getTokenPriceUSD } from '@lib/utils/token';
import { PassportPage } from '@magiclabs/ui-components';
import { Spacer } from '@styled/jsx';
import { Network } from 'magic-passport/types';
import { useEffect, useState } from 'react';

export default function NativeGasTokenNftMint() {
  const { t } = useTranslation('passport');
  const { doSendUserOperation } = useDoSendUserOperation();
  const { smartAccount, isLoading: isSmartAccountLoading, isCheckingCABStatus, isPreparingAccount } = useSmartAccount();
  const { exchangeUsdcToEth } = useCEX({ smartAccount });
  const router = usePassportRouter();
  const network = usePassportStore(state => state.decodedQueryParams.network) as Network;
  const [appReferrer, setAppReferrer] = useState<string>('');
  const appConfig = usePassportAppConfig();
  useEffect(() => setAppReferrer(window?.document?.referrer), []);

  const [hasTransactionBeenSent, setHasTransactionBeenSent] = useState(false);
  const [isPayWithDrawerOpen, setIsPayWithDrawerOpen] = useState(false);
  const [isRetrievingCabBalance, setIsRetrievingCabBalance] = useState(true);
  const [selectedSendToken, setSelectedSendToken] = useState<DrawerTokenMetadata>(getDrawerTokens(network)[0]);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const popupPayload = PopupAtomicRpcPayloadService.getActiveRpcPayload();
  const calls = getCallsFromParams(popupPayload?.params);
  const appName = appConfig?.name || '';

  const { nftName, nftImage } = useNFTMetadata({ calls, network });

  const { data: usdcBalance } = useUsdcBalance();
  useEffect(() => {
    if (usdcBalance === undefined) return;
    if (usdcBalance === BigInt(0)) {
      setSelectedSendToken(getNativeTokenMetadata(network));
    }
    setIsRetrievingCabBalance(false);
  }, [usdcBalance]);
  const {
    error: networkFeeError,
    isLoading: isEstimatingNetworkFee,
    networkFeeUsd,
    networkFeeUsdFormatted,
    networkFeeNativeToken,
    networkFeeNativeTokenFormatted,
  } = useEstimateNetworkFee({
    calls,
    smartAccount,
    enabled: !hasTransactionBeenSent && !isRetrievingCabBalance,
    isCabOperation: !selectedSendToken.isNativeToken,
    selectedTokenSymbol: selectedSendToken.symbol,
  });

  const {
    hasEnoughForFee,
    hasEnoughForSendAmount,
    error: insufficientFundsError,
  } = useCheckBalance({
    calls,
    networkFeeNativeToken,
    token: selectedSendToken,
  });

  const { sendAmountTokenFormatted, sendAmountUsdFormatted } = useUserOperationValue({
    calls,
    selectedTokenSymbol: selectedSendToken.symbol,
  });

  let networkFeeAmountDisplay = networkFeeNativeToken ? networkFeeNativeTokenFormatted : '';

  if (!selectedSendToken.isNativeToken && networkFeeUsd) {
    const tokenPrice = getTokenPriceUSD(selectedSendToken.symbol);
    const amountToken = networkFeeUsd * tokenPrice;
    networkFeeAmountDisplay = amountToken.toFixed(selectedSendToken.decimals);
  }

  const networkFeeInUsdDisplay = networkFeeUsd ? networkFeeUsdFormatted : '';

  const handleSelectSendToken = (sendToken: DrawerTokenMetadata) => () => {
    setSelectedSendToken(sendToken);
    setIsPayWithDrawerOpen(false);
  };

  const handleError = (e?: Error) => {
    let errorCode = PassportPageErrorCodes.TRANSACTION_FAILED;
    if (e?.message === PassportPageErrorCodes.ERROR_CHECKING_CEX_RATE_LIMIT) {
      errorCode = PassportPageErrorCodes.ERROR_CHECKING_CEX_RATE_LIMIT;
    }
    router.replace(PASSPORT_ERROR_URL(errorCode));
  };

  const doNativeGasTokenNftMint = async () => {
    if (!calls) throw new Error('doNativeGasTokenNftMint: No calls found in payload');
    if (!smartAccount) throw new Error('doNativeGasTokenNftMint: Smart account not found');
    if (!network) throw new Error('doNativeGasTokenNftMint: Network not found');

    setHasTransactionBeenSent(true);
    const userOpCalls: KernelClientCallData[] = [
      {
        to: calls[0].to,
        value: calls[0].value ? BigInt(calls[0].value) : BigInt(0),
        data: formatDataField(calls[0]),
      },
    ];
    try {
      setTransactionHash(null);
      let useropHash;
      const useCabClient = !selectedSendToken.isNativeToken;
      if (!useCabClient) {
        useropHash = await doSendUserOperation(smartAccount, userOpCalls, false);
      } else {
        const valueAmountWei = getTotalValueInWei(calls);
        if (valueAmountWei !== BigInt(0) && CEX_SUPPORTED_NETWORK_IDS.includes(network?.id)) {
          await exchangeUsdcToEth(valueAmountWei);
        }
        useropHash = await doSendUserOperation(smartAccount, userOpCalls, true);
      }
      setTransactionHash(useropHash);
      resolvePopupRequest(useropHash, false);
    } catch (error) {
      logger.error('Error sending transaction - nft_mint', error);
      handleError(error as Error);
    }
  };

  useEffect(() => {
    setAppReferrer(window?.document?.referrer);
  }, []);

  if (hasTransactionBeenSent) {
    return (
      <PassportTransactionStatus
        hash={transactionHash}
        nftData={{ imageUrl: nftImage, name: nftName }}
        isTransactionActive={hasTransactionBeenSent}
        onTransactionError={error => {
          logger.error('Error completing transaction - nft_mint', error);
          handleError(error as Error);
        }}
      />
    );
  }

  if (isPreparingAccount) {
    return (
      <PassportPage>
        <TransactionHeader />
        <PassportPage.Content>
          <PassportLoadingSpinner text={t('Getting your account ready, please wait')} />
        </PassportPage.Content>
      </PassportPage>
    );
  }

  return (
    <PassportPage>
      <TransactionHeader />
      <PassportPage.Header name={appName} domain={appReferrer} />
      <PassportPage.Content>
        <NftImagePreview
          nftImage={nftImage}
          nftName={nftName}
          size={72}
          isLoading={isSmartAccountLoading || isCheckingCABStatus}
        />
        <Spacer size="2" />
        <TransactionToAddress />
        <TransactionSendAmount
          calls={calls}
          sendAmountTokenFormatted={sendAmountTokenFormatted}
          sendAmountUsdFormatted={sendAmountUsdFormatted}
          hasEnoughForSendAmount={hasEnoughForSendAmount}
          selectedSendToken={selectedSendToken}
          onPress={() => setIsPayWithDrawerOpen(true)}
        />
        <TransactionNetworkFee
          selectedSendToken={selectedSendToken}
          isEstimatingNetworkFee={isEstimatingNetworkFee}
          networkFeeNativeToken={networkFeeNativeToken}
          networkFeeAmountDisplay={networkFeeAmountDisplay}
          networkFeeUsd={networkFeeUsd}
          networkFeeInUsdDisplay={networkFeeInUsdDisplay}
          networkFeeError={networkFeeError}
          hasEnoughForFee={hasEnoughForFee}
          insufficientFundsError={insufficientFundsError}
          setIsPayWithDrawerOpen={setIsPayWithDrawerOpen}
        />
      </PassportPage.Content>
      <TransactionConfirmButton
        isSending={hasTransactionBeenSent}
        networkFeeUsd={networkFeeUsd}
        networkFeeNativeToken={networkFeeNativeToken}
        networkFeeError={networkFeeError}
        hasEnoughForFee={hasEnoughForFee}
        hasEnoughForSendAmount={hasEnoughForSendAmount}
        onConfirm={doNativeGasTokenNftMint}
      />
      <TransactionCancelButton isSending={hasTransactionBeenSent} onPress={window.close} />
      <TokenSelectionDrawer
        isOpen={isPayWithDrawerOpen}
        setIsOpen={setIsPayWithDrawerOpen}
        handleSelectSendToken={handleSelectSendToken}
      />
    </PassportPage>
  );
}
