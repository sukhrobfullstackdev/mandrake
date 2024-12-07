import { useCurrencyFormatter } from '@hooks/common/currency-formatter';
import { useEthereumProxy } from '@hooks/common/ethereum-proxy';
import { useNativeTokenPrice } from '@hooks/common/token';
import { getFiatValue } from '@lib/ledger/evm/utils/bn-math';
import { formatEther, getBigInt } from 'ethers';
import { useEffect, useState } from 'react';

export const useBalanceInUsd = (address: string) => {
  const [balanceInUsd, setBalanceInUsd] = useState(0);
  const [tokenPrice, setTokenPrice] = useState('');
  const { tokenPriceData, isTokenPriceFetched, isTokenPriceRefetching } = useNativeTokenPrice();
  const { getBalance } = useEthereumProxy();
  const { formattedValue: formattedBalance } = useCurrencyFormatter({ value: balanceInUsd });

  const getWalletBalance = async () => {
    const balance = await getBalance(address);
    const weiValue = getBigInt(balance);
    const usdBalance = getFiatValue(weiValue, tokenPrice);
    setBalanceInUsd(usdBalance);
  };

  useEffect(() => {
    if (!isTokenPriceFetched || !tokenPriceData) return;
    setTokenPrice(tokenPriceData.toCurrencyAmountDisplay);
  }, [tokenPriceData, isTokenPriceFetched, isTokenPriceRefetching]);

  useEffect(() => {
    if (!address || !tokenPrice) return;
    getWalletBalance();
  }, [address, tokenPrice]);

  return formattedBalance;
};

export const useNativeTokenBalance = (address: string) => {
  const [nativeBalance, setNativeBalance] = useState<number>(0);
  const { getBalance } = useEthereumProxy();

  const getNativeBalance = async () => {
    const balance = await getBalance(address);
    const weiBalance = getBigInt(balance);
    const tokenBalance = parseFloat(formatEther(weiBalance));
    setNativeBalance(tokenBalance);
  };

  useEffect(() => {
    if (!address) return;
    getNativeBalance();
  }, [address]);

  return nativeBalance;
};
