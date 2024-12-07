'use client';

/* istanbul ignore file */

import ConstructTransactionNetworkFee from '@app/send/rpc/wallet/magic_wallet/compose_transaction/__components__/network-fee';
import WalletAmountAvailable from '@app/send/rpc/wallet/magic_wallet/compose_transaction/__components__/wallet-amount-available';
import WalletSendAddress from '@app/send/rpc/wallet/magic_wallet/compose_transaction/__components__/wallet-send-address';
import WalletSendAmount from '@app/send/rpc/wallet/magic_wallet/compose_transaction/__components__/wallet-send-amount';
import WalletPageHeader from '@components/show-ui/wallet-page-header';
import { useEthereumProxy } from '@hooks/common/ethereum-proxy';
import { useSendRouter } from '@hooks/common/send-router';
import { useNativeTokenPrice } from '@hooks/common/token';
import { useUserMetadata } from '@hooks/common/user-metadata';
import { useTranslation } from '@lib/common/i18n';
import { calculateNetworkGasFee } from '@lib/ledger/evm/gas/network-gas-fee';
import { getFiatValue } from '@lib/ledger/evm/utils/bn-math';
import { JsonRpcRequestPayload } from '@magic-sdk/types';
import { Button, Page } from '@magiclabs/ui-components';
import { Box } from '@styled/jsx';
import { getBigInt, toBeHex } from 'ethers';
import { useSearchParams } from 'next/navigation';
import { useCallback, useLayoutEffect, useState } from 'react';

interface WalletAddressState {
  address: string | number;
  isValid: boolean;
}

interface SendAmountState {
  value: string | number;
  isValid: boolean;
}

export default function WalletSendFundsPage() {
  const { t } = useTranslation('send');
  const router = useSendRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [sendToWalletAddress, setSendToWalletAddress] = useState<WalletAddressState>({ address: '', isValid: false });
  const [networkFeeInWei, setNetworkFeeInWei] = useState(0);
  const [sendAmount, setSendAmount] = useState<SendAmountState>({ value: 0, isValid: false });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSendTransactionValid, setIsSendTransactionValid] = useState(false);
  const { tokenPriceData } = useNativeTokenPrice();
  const { userMetadata } = useUserMetadata();
  const { getBalance } = useEthereumProxy();
  const [nativeTokenBalanceWei, setNativeTokenBalanceWei] = useState<number>(0);
  const searchParams = useSearchParams();
  const contractAddress = searchParams.get('contractAddress')?.trim();
  const logo = searchParams.get('logo')?.trim();
  const decimals = searchParams.get('decimals')?.trim();
  const symbol = searchParams.get('symbol')?.trim();
  const erc20balance = searchParams.get('balanceInWei')?.trim();
  const [isInputFormatFiat, setIsInputFormatFiat] = useState<boolean>(!contractAddress);
  const [isDisabled, setIsDisabled] = useState(false);

  const formatData = (): string | number => {
    if (!contractAddress) return '0x';
    const amount: string | number = sendAmount.value;
    // `functionSig` calculated from `web3.sha3('transfer(address,uint256)')`
    const functionSig = '0xa9059cbb';
    const functionSigPadding = '000000000000000000000000';
    const formattedAmount = toBeHex(getBigInt(amount)).substring(2); // strip beginning '0x'
    const amountPaddingLength = 64 - formattedAmount.length;
    const amountPadding = '0'.repeat(amountPaddingLength);
    const to = sendToWalletAddress.address.toString().substring(2); // strip beginning '0x'
    return `${functionSig}${functionSigPadding}${to}${amountPadding}${formattedAmount}`;
  };

  const handleSendEthTransaction = () => {
    if (!userMetadata) return;
    setIsDisabled(true);
    const txObject = {
      to: contractAddress || sendToWalletAddress.address,
      from: userMetadata.publicAddress,
      value: contractAddress ? '0x0' : sendAmount.value,
      data: formatData(),
      logo: logo || '',
    };
    const params = encodeURIComponent(JSON.stringify(txObject));
    router.replace(`/send/rpc/eth/eth_sendTransaction${contractAddress ? '/erc_20' : '/evm'}?txObject=${params}`);
  };

  const walletAddressCallback = useCallback((address: WalletAddressState) => {
    setSendToWalletAddress(address);
  }, []);

  const sendAmountCallback = useCallback((amount: SendAmountState) => {
    setSendAmount(amount);
  }, []);

  const setIsLoadingCallback = useCallback(() => {
    setIsLoading(!isLoading);
  }, []);

  // Show user balance available
  useLayoutEffect(() => {
    if (!userMetadata?.publicAddress) return;
    (async () => {
      try {
        const balanceInWei: string = await getBalance(userMetadata.publicAddress as string);
        setNativeTokenBalanceWei(Number(balanceInWei));
      } catch (error) {
        logger.error(error);
      }
    })();
  }, [userMetadata]);

  useLayoutEffect(() => {
    setIsSendTransactionValid(sendAmount.isValid && sendToWalletAddress.isValid);
  }, [sendAmount, sendToWalletAddress]);

  useLayoutEffect(() => {
    if (!nativeTokenBalanceWei || !userMetadata) return;
    // Only need to calculate network fee if sending native token
    if (contractAddress) {
      setNetworkFeeInWei(0);
      return setIsLoadingCallback();
    }
    (async () => {
      const networkFee = await calculateNetworkGasFee(
        {
          method: 'magic_wallet',
          params: [
            {
              to: userMetadata.publicAddress,
              from: userMetadata.publicAddress,
              value: 0,
            },
          ],
        } as JsonRpcRequestPayload,
        userMetadata.publicAddress as string,
        true,
      );
      setNetworkFeeInWei(Number(networkFee));
      setIsLoadingCallback();
    })();
    return () => {};
  }, [nativeTokenBalanceWei, userMetadata]);

  return (
    <>
      <WalletPageHeader onPressBack={() => router.replace('/send/rpc/wallet/magic_wallet/token_selection')} />
      <Page.Content>
        <WalletAmountAvailable
          logo={logo}
          contractAddress={contractAddress}
          decimals={Number(decimals)}
          symbol={symbol}
          balance={erc20balance}
          isInputFormatFiat={isInputFormatFiat}
          balanceInWei={nativeTokenBalanceWei || 0}
          balanceInUsd={getFiatValue(
            getBigInt(nativeTokenBalanceWei.toString()),
            tokenPriceData?.toCurrencyAmountDisplay || '0',
          )}
        />
        <WalletSendAddress onChangeWalletAddressHandler={walletAddressCallback} isLoading={isLoading} />
        <Box m="0.1rem 0" />
        <WalletSendAmount
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
          onChangeSendAmountHandler={sendAmountCallback}
          networkFee={networkFeeInWei}
          isLoading={isLoading}
          symbol={symbol}
          erc20balance={erc20balance}
          decimals={Number(decimals)}
          contractAddress={contractAddress}
          isInputFormatFiat={isInputFormatFiat}
          setIsInputFormatFiat={setIsInputFormatFiat}
        />
        {!contractAddress && !isLoading && tokenPriceData ? (
          <ConstructTransactionNetworkFee
            networkFeeInWei={networkFeeInWei.toString()}
            isInputFormatFiat={isInputFormatFiat}
            price={tokenPriceData.toCurrencyAmountDisplay}
          />
        ) : (
          <Box h="1rem" />
        )}
        <Box w="100%" maxWidth={'25rem'}>
          <Button
            expand
            disabled={sendAmount && (!isSendTransactionValid || !!errorMessage || isDisabled)}
            validating={isDisabled}
            onPress={handleSendEthTransaction}
            label={t('Next')}
          />
        </Box>
      </Page.Content>
    </>
  );
}
