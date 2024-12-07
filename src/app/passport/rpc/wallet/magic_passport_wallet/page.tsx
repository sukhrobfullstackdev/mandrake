'use client';

import WalletActions from '@app/passport/rpc/wallet/components/wallet-actions';
import WalletHeader from '@app/passport/rpc/wallet/components/wallet-header';
import WalletNavigation from '@app/passport/rpc/wallet/components/wallet-navigation';
import { TokenListItemSkeleton } from '@app/passport/rpc/wallet/components/wallet-skeletons';
import { useTranslation } from '@common/i18n';
import { useCurrencyFormatter } from '@hooks/common/currency-formatter';
import { usePassportStore } from '@hooks/data/passport/store';
import {
  useErc20TokenBalances,
  useErc20TokenMetadata,
  useNativeTokenBalance,
  useUsdcBalance,
} from '@hooks/passport/token';
import { getTokenPriceUSD } from '@lib/utils/token';
import {
  LogoEthereumCircleMono,
  TokenListItem,
  TokenUsdc,
  WalletNavigationType,
  WalletPage,
} from '@magiclabs/ui-components';
import { Divider, VStack } from '@styled/jsx';
import { formatUnits } from 'ethers';
import { Network } from 'magic-passport/types';
import Image from 'next/image';
import { Fragment, useEffect } from 'react';

const NEWT_LOGO = '/images/newt-avatar.png';

export default function PassportShowUIPage() {
  const { t } = useTranslation('passport');
  const network = usePassportStore(state => state.decodedQueryParams.network) as Network;
  // NEWT token address for Base Sepolia and Newton chain
  const newtTokenAddress =
    network.id === 84532 ? '0xde4de4a0a3df5b4b931ea6513c4f8971976ed975' : '0xb01e6ad21b553bb114e58784592efa1213fb5490';

  const { data: usdcBalance, isLoading: isLoadingUsdcBalance } = useUsdcBalance();
  const { data: nativeBalance, isLoading: isLoadingNativeBalance } = useNativeTokenBalance();
  const { data: erc20TokenBalances, isLoading: isLoadingAllTokenBalances } = useErc20TokenBalances();
  const { data: erc20TokenMetadata, mutate: mutateTokenMetadata } = useErc20TokenMetadata();
  const balancesLoading = isLoadingUsdcBalance || isLoadingNativeBalance || isLoadingAllTokenBalances;

  // todo: use correct value for newt token
  // currently 1 NEWT is considered equal to 1 USDC
  let newtUsdAmount = '0';
  const newtToken = erc20TokenBalances?.find(item => item.contractAddress.toLowerCase() === newtTokenAddress);
  if (newtToken && erc20TokenMetadata) {
    newtUsdAmount = formatUnits(
      newtToken?.tokenBalance || 0,
      Number(erc20TokenMetadata[newtToken.contractAddress.toLowerCase()].decimals),
    );
  }

  const usdcAmount = usdcBalance ? Number(formatUnits(usdcBalance!, 6)) : 0;
  const nativeAmount = nativeBalance ? getTokenPriceUSD('ETH') * Number(nativeBalance || 0) : 0;
  const totalAmount = usdcAmount + nativeAmount + Number(newtUsdAmount);

  const { formattedValue: newtFormattedValue } = useCurrencyFormatter({
    value: Number(newtUsdAmount),
    currency: 'USD',
  });
  const { formattedValue: usdcFormattedValue } = useCurrencyFormatter({ value: usdcAmount, currency: 'USD' });
  const { formattedValue: nativeTokenFormattedValue } = useCurrencyFormatter({ value: nativeAmount, currency: 'USD' });
  const { value, symbol } = useCurrencyFormatter({ value: totalAmount, currency: 'USD' });
  const totalFormattedValue = !balancesLoading && totalAmount ? value : undefined;

  useEffect(() => {
    if (erc20TokenBalances?.length) {
      mutateTokenMetadata(erc20TokenBalances);
    }
  }, [erc20TokenBalances?.length]);

  return (
    <>
      <WalletHeader />
      <WalletActions />
      <WalletPage.Fiat symbol={symbol} fiatTotal={totalFormattedValue} />
      <WalletNavigation active={WalletNavigationType.Home} />

      <WalletPage.Content>
        <VStack w="full" p={7}>
          {balancesLoading ? (
            <>
              <TokenListItemSkeleton />
              <Divider color="neutral.primary" />
              <TokenListItemSkeleton />
            </>
          ) : (
            <>
              <TokenListItem
                name="Ethereum"
                fiatBalanceWithSymbol={nativeTokenFormattedValue}
                tokenBalanceWithSymbol={`${nativeBalance} ETH`}
              >
                <TokenListItem.TokenIcon>
                  <LogoEthereumCircleMono />
                </TokenListItem.TokenIcon>
              </TokenListItem>
              <Divider color="neutral.primary" />
              <TokenListItem
                name="USDC"
                fiatBalanceWithSymbol={usdcFormattedValue}
                tokenBalanceWithSymbol={`${usdcAmount} USDC`}
              >
                <TokenListItem.TokenIcon>
                  <TokenUsdc />
                </TokenListItem.TokenIcon>
              </TokenListItem>
              {Number(newtUsdAmount) > 0 && (
                <>
                  <Divider color="neutral.primary" />
                  <TokenListItem
                    name="NEWT"
                    fiatBalanceWithSymbol={newtFormattedValue}
                    tokenBalanceWithSymbol={`${newtUsdAmount} NEWT`}
                  >
                    <TokenListItem.TokenIcon>
                      <Image alt="NEWT Token" src={NEWT_LOGO} />
                    </TokenListItem.TokenIcon>
                  </TokenListItem>
                </>
              )}
            </>
          )}
          {!balancesLoading &&
            erc20TokenMetadata &&
            erc20TokenBalances
              ?.filter(item => item.contractAddress.toLowerCase() !== newtTokenAddress)
              .map(item => {
                return (
                  <Fragment key={item.contractAddress}>
                    <Divider color="neutral.primary" />
                    <TokenListItem
                      name={erc20TokenMetadata[item.contractAddress].name || t('Unknown')}
                      tokenBalanceWithSymbol={`${formatUnits(
                        item.tokenBalance || '0',
                        Number(erc20TokenMetadata[item.contractAddress].decimals),
                      )} ${erc20TokenMetadata[item.contractAddress].symbol}`}
                    />
                  </Fragment>
                );
              })}
        </VStack>
      </WalletPage.Content>
    </>
  );
}
