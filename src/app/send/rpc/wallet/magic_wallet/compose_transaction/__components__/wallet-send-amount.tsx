/* istanbul ignore file */

import { useChainInfo } from '@hooks/common/chain-info';
import { formatParts } from '@hooks/common/currency-formatter';
import { useEthereumProxy } from '@hooks/common/ethereum-proxy';
import { useLocale } from '@hooks/common/locale';
import { useNativeTokenPrice } from '@hooks/common/token';
import { useUserMetadata } from '@hooks/common/user-metadata';
import { getFiatValue, subtract } from '@lib/ledger/evm/utils/bn-math';
import { IcoSwap, Text, TextInput } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { HStack } from '@styled/jsx';
import { formatUnits, getBigInt, parseUnits, toBeHex } from 'ethers';
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';

const fiatFormatter = (locale: string) => {
  return new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  });
};

const tokenFormatter = (locale: string) => {
  return new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: 6,
    maximumFractionDigits: 20,
  });
};

const formatFiat = (formatter: Intl.NumberFormat, value: number) => {
  return formatParts({ parts: formatter.formatToParts(value), fractionDigits: 2 });
};

const formatToken = (formatter: Intl.NumberFormat, value: number) => {
  return formatParts({ parts: formatter.formatToParts(value), fractionDigits: 7 });
};

interface WalletSendAmountProps {
  onChangeSendAmountHandler: ({ value, isValid }: { value: string; isValid: boolean }) => void;
  networkFee: number;
  isLoading: boolean;
  decimals: number | undefined;
  erc20balance: string | undefined;
  symbol: string | undefined;
  contractAddress: string | undefined;
  isInputFormatFiat: boolean;
  errorMessage: string;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setIsInputFormatFiat: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function WalletSendAmount({
  onChangeSendAmountHandler,
  errorMessage,
  setErrorMessage,
  networkFee,
  isLoading,
  decimals,
  erc20balance,
  symbol,
  contractAddress,
  isInputFormatFiat,
  setIsInputFormatFiat,
}: WalletSendAmountProps) {
  const [maxFiatAmount, setMaxFiatAmount] = useState('');
  const [maxTokenAmount, setMaxTokenAmount] = useState('');
  const { tokenPriceData } = useNativeTokenPrice();
  const { userMetadata } = useUserMetadata();
  const { getBalance } = useEthereumProxy();
  const [balanceData, setBalanceData] = useState();
  const [formattedInputValue, setFormattedInputValue] = useState('');
  const [formattedAltValue, setFormattedAltValue] = useState('');
  const locale = useLocale();
  const { chainInfo } = useChainInfo();
  const fiatFormatterInst = fiatFormatter(locale);
  const tokenFormatterInst = tokenFormatter(locale);

  const setAmountToMax = useCallback(() => {
    if (isInputFormatFiat) {
      setFormattedInputValue(maxFiatAmount);
      setFormattedAltValue(maxTokenAmount);
    } else {
      setFormattedInputValue(maxTokenAmount);
      setFormattedAltValue(maxFiatAmount);
    }
  }, [maxFiatAmount, maxTokenAmount, formattedInputValue, isInputFormatFiat]);

  const sanitizeInput = (string: string, regex: RegExp, replaceWith: string): string => {
    return string.replace(regex, replaceWith);
  };

  useLayoutEffect(() => {
    if (!userMetadata) return;
    getBalance(userMetadata.publicAddress as string).then(setBalanceData);
  }, [userMetadata]);

  useLayoutEffect(() => {
    if (!balanceData || !tokenPriceData) return;
    const maxSendInWei = subtract(balanceData, networkFee);
    const maxSendInFiat = getFiatValue(maxSendInWei, tokenPriceData.toCurrencyAmountDisplay);
    setMaxFiatAmount(sanitizeInput(formatFiat(fiatFormatterInst, maxSendInFiat), /[^0-9.]/g, ''));
    const formattedMaxSendInFiat = sanitizeInput(formatFiat(fiatFormatterInst, maxSendInFiat), /[^0-9.]/g, '');
    const maxSendEthAmount = sanitizeInput(
      formatToken(tokenFormatterInst, Number(formattedMaxSendInFiat) / Number(tokenPriceData.toCurrencyAmountDisplay)),
      /[^0-9.]/g,
      '',
    );
    let maxTokenAmountLocal = maxSendEthAmount;
    if (contractAddress) {
      maxTokenAmountLocal = Number(formatUnits(erc20balance || '0', decimals || 18)).toString();
    }
    setMaxTokenAmount(maxTokenAmountLocal);
  }, [balanceData, networkFee, tokenPriceData]);

  const onChangeHandler = useCallback(
    (event: string) => {
      if (!tokenPriceData) return;
      const sanitizedInput = sanitizeInput(event, /[^0-9.]/g, '');
      if (isInputFormatFiat) {
        // if ends with . remove the . for calculations
        if (sanitizedInput.endsWith('.')) {
          setFormattedAltValue(
            formatToken(
              tokenFormatterInst,
              Number(sanitizedInput.replace('.', '')) / Number(tokenPriceData.toCurrencyAmountDisplay),
            ),
          );
          return setFormattedInputValue(sanitizedInput);
        }
        // if exactly one decimal places convert to cents by removing decimal place
        if (/^\d+\.\d{1,1}$/.test(sanitizedInput)) {
          setFormattedAltValue(
            formatToken(
              tokenFormatterInst,
              Number(sanitizedInput.replace('.', '')) / Number(tokenPriceData.toCurrencyAmountDisplay) / 10,
            ),
          );
          return setFormattedInputValue(sanitizedInput);
        }
        // if exactly two decimal places convert to cents by removing decimal place
        if (/^\d+\.\d{2,2}$/.test(sanitizedInput)) {
          setFormattedAltValue(
            formatToken(
              tokenFormatterInst,
              Number(sanitizedInput.replace('.', '')) / Number(tokenPriceData.toCurrencyAmountDisplay) / 100,
            ),
          );
          return setFormattedInputValue(sanitizedInput);
        }
        // strip anything beyond 2 decimal places
        if (/^\d+\.\d{2,}$/.test(sanitizedInput)) {
          const [integerPart, decimalPart] = sanitizedInput.split('.');
          return setFormattedInputValue(sanitizeInput(`${integerPart}.${decimalPart.slice(0, 2)}`, /[^0-9-.]/g, ''));
        }
        setFormattedAltValue(
          formatToken(tokenFormatterInst, Number(sanitizedInput) / Number(tokenPriceData.toCurrencyAmountDisplay)),
        );
        setFormattedInputValue(sanitizedInput);
      } else {
        if (/^\d+\.\d{7,}$/.test(sanitizedInput)) {
          const [integerPart, decimalPart] = sanitizedInput.split('.');
          setFormattedAltValue(
            formatFiat(fiatFormatterInst, Number(sanitizedInput) * Number(tokenPriceData.toCurrencyAmountDisplay)),
          );
          return setFormattedInputValue(sanitizeInput(`${integerPart}.${decimalPart.slice(0, 6)}`, /[^0-9-.]/g, ''));
        }
        if (sanitizedInput.endsWith('.')) {
          const [integerPart] = sanitizedInput.split('.');
          setFormattedAltValue(
            formatFiat(fiatFormatterInst, Number(integerPart) * Number(tokenPriceData.toCurrencyAmountDisplay)),
          );
          return setFormattedInputValue(sanitizeInput(`${integerPart}.`, /[^0-9-.]/g, ''));
        }
        const [integerPart, decimalPart] = sanitizedInput.split('.');
        setFormattedAltValue(
          formatFiat(fiatFormatterInst, Number(sanitizedInput) * Number(tokenPriceData.toCurrencyAmountDisplay)),
        );
        return setFormattedInputValue(
          sanitizeInput(`${integerPart}${decimalPart ? '.' : ''}${decimalPart?.slice(0, 6) || ''}`, /[^0-9-.]/g, ''),
        );
      }
    },
    [isInputFormatFiat, formattedAltValue, tokenPriceData],
  );

  const toggleInputType = useCallback(() => {
    setIsInputFormatFiat(!isInputFormatFiat);
    setFormattedInputValue(formattedAltValue);
    setFormattedAltValue(formattedInputValue);
  }, [formattedAltValue, formattedInputValue, isInputFormatFiat, setIsInputFormatFiat]);

  useEffect(() => {
    // ERC20 tokens
    if (contractAddress) {
      if (
        formattedInputValue &&
        Number(formattedInputValue) > Number(formatUnits(erc20balance || '0', decimals || 18))
      ) {
        return setErrorMessage('Insufficient funds.');
      }
      setErrorMessage('');
      return onChangeSendAmountHandler({
        value: parseUnits(formattedInputValue || '0', decimals || 18).toString(),
        isValid: !errorMessage.length && !!formattedInputValue,
      });
    }

    // Native tokens
    if (!contractAddress) {
      if (isInputFormatFiat && Number(formattedInputValue) > Number(maxFiatAmount)) {
        return setErrorMessage(
          `Insufficient funds. $${maxFiatAmount} (${maxTokenAmount} ${chainInfo?.currency}) available after network fee.`,
        );
      }
      if (
        typeof formattedInputValue === 'undefined' ||
        (typeof formattedInputValue === 'string' && !formattedInputValue.length)
      ) {
        return setErrorMessage('');
      }
      if (!isInputFormatFiat && Number(formattedInputValue) > Number(maxTokenAmount)) {
        return setErrorMessage(
          `Insufficient funds. ${maxTokenAmount} ${chainInfo?.currency} ($${maxFiatAmount}) available after network fee.`,
        );
      }
      setErrorMessage('');
      const alt = isInputFormatFiat ? formattedAltValue || '0' : formattedInputValue || '0';
      onChangeSendAmountHandler({
        value: toBeHex(getBigInt(parseUnits(alt.replaceAll(',', ''), 'ether'))),
        isValid: !errorMessage.length,
      });
    }
    if (!isInputFormatFiat && Number(formattedInputValue) > Number(maxTokenAmount)) {
      return setErrorMessage(
        `Insufficient funds. ${maxTokenAmount} ${chainInfo?.currency} ($${maxFiatAmount}) available after network fee.`,
      );
    }
    setErrorMessage('');
    const alt = isInputFormatFiat ? formattedAltValue || '0' : formattedInputValue || '0';
    onChangeSendAmountHandler({
      value: toBeHex(getBigInt(parseUnits(alt.replaceAll(',', ''), 'ether'))),
      isValid: !errorMessage.length,
    });
  }, [isInputFormatFiat, formattedInputValue, formattedAltValue, networkFee, errorMessage]);

  const altDisplayValue = () =>
    `${!isInputFormatFiat ? '$' : ''}${formattedAltValue || '0'} ${isInputFormatFiat ? chainInfo?.currency : ''}`;

  return !isLoading ? (
    <>
      <TextInput
        type="number"
        errorMessage={errorMessage}
        onChange={onChangeHandler}
        value={formattedInputValue}
        className={css({ width: '100%', maxWidth: '25rem' })}
        label="Amount"
        placeholder={isInputFormatFiat ? '0.00' : '0'}
      >
        <TextInput.Prefix>{isInputFormatFiat ? '$' : ''}</TextInput.Prefix>
        <TextInput.Suffix>{!isInputFormatFiat ? symbol || chainInfo?.currency : 'USD'}</TextInput.Suffix>
        <TextInput.ActionButton label="Max" onPress={setAmountToMax} />
      </TextInput>
      {!contractAddress ? (
        <HStack mt="0.3rem" w="100%" maxWidth="25rem">
          <IcoSwap style={{ cursor: 'pointer' }} onClick={toggleInputType} height={12} width={12} />
          <Text size="xs">{altDisplayValue()}</Text>
        </HStack>
      ) : null}
    </>
  ) : null;
}
