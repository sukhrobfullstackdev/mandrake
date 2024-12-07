/* istanbul ignore file */
'use client';
import { CurrencyFormatter } from '@app/send/rpc/eth/eth_sendTransaction/__components__/currency-formatter';
import { TokenFormatter } from '@app/send/rpc/eth/eth_sendTransaction/__components__/token-formatter';
import { GradientCircle } from '@app/send/rpc/nft/magic_nft_transfer/__components__/gradient-circle';
import { handleEstimateNetworkFee } from '@app/send/rpc/nft/magic_nft_transfer/__hooks__/use-estimate-network-fee';
import OwnedNftTile from '@components/show-ui/owned-nft-tile';
import { ALCHEMY_KEYS } from '@constants/alchemy';
import { NFT_TRANSFER_ROUTES } from '@constants/nft';
import { useChainInfo } from '@hooks/common/chain-info';
import { useHydrateOrCreateEthWallet } from '@hooks/common/hydrate-or-create-wallets/hydrate-or-create-eth-wallet';
import { useSendRouter } from '@hooks/common/send-router';
import { useNativeTokenPrice } from '@hooks/common/token';
import { useUserMetadata } from '@hooks/common/user-metadata';
import { useSingleNft } from '@hooks/data/embedded/alchemy';
import { OwnedNFT } from '@hooks/passport/use-nfts-for-owner';
import { useTranslation } from '@lib/common/i18n';
import { isEmpty } from '@lib/utils/is-empty';
import truncateAddress from '@lib/utils/truncate-address';
import { IcoQuestionCircleFill, LoadingSpinner, Text, Tooltip } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, Center, Divider, HStack, Spacer, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useEffect, useMemo, useState } from 'react';
import { formatEther } from 'viem';

type Props = {
  contractAddress: string;
  tokenId: string;
  count: number;
  to: string;
};

export const CollectibleTransferPreview = ({ contractAddress, tokenId, count, to }: Props) => {
  const router = useSendRouter();
  const { t } = useTranslation('send');
  const { chainInfo } = useChainInfo();
  const BlockChainIcon = chainInfo?.blockchainIcon as React.FC<{ width: number; height: number }>;
  const networkName = chainInfo?.networkName as keyof typeof ALCHEMY_KEYS;
  const [isNetworkFeePending, setIsNetworkFeePending] = useState(false);
  const [networkFee, setNetworkFee] = useState<bigint | null>(null);
  const walletAddress = useUserMetadata().userMetadata?.publicAddress ?? '';
  const { credentialsData, walletInfoData, ethWalletHydrationError } = useHydrateOrCreateEthWallet();
  const {
    data: nft,
    isError,
    isPending,
  } = useSingleNft(
    {
      networkName,
      contractAddress: contractAddress || '',
      tokenId: tokenId || '',
    },
    {
      enabled: Boolean(walletAddress) && !isEmpty(walletAddress),
    },
  );

  useEffect(() => {
    async function getNetworkFee() {
      const data = await handleEstimateNetworkFee({
        chainId: chainInfo?.chainId as number,
        to,
        contractAddress,
        quantity: count,
        tokenId,
        tokenType: nft?.tokenType ?? 'ERC721',
        walletAddress,
        credentialsData,
        walletInfoData,
        ethWalletHydrationError,
      });
      setIsNetworkFeePending(false);
      setNetworkFee(data);
    }

    getNetworkFee();
  }, [nft, chainInfo, count, to, contractAddress, tokenId, credentialsData, walletInfoData, ethWalletHydrationError]);

  const { tokenPriceData, tokenPriceError, isTokenPricePending } = useNativeTokenPrice();

  const priceInUsd = useMemo(() => {
    if (isNetworkFeePending || isTokenPricePending) {
      return <LoadingSpinner size={20} strokeWidth={2.5} neutral />;
    }

    if (tokenPriceError || !tokenPriceData || !networkFee) {
      return (
        <Text size="sm" styles={{ color: token('colors.text.tertiary') }}>
          {t('Error calculating network fee')}
        </Text>
      );
    }

    const conversionRate = parseFloat(tokenPriceData.toCurrencyAmountDisplay);
    const tokenValue = parseFloat(formatEther(networkFee));
    const currencyValue = tokenValue * conversionRate;

    return (
      <HStack>
        <Text size="sm" styles={{ color: token('colors.text.tertiary') }}>
          <TokenFormatter value={tokenValue} />
        </Text>
        <Text>
          <CurrencyFormatter value={currencyValue} />
        </Text>
      </HStack>
    );
  }, [networkFee, tokenPriceData, isNetworkFeePending, isTokenPricePending, tokenPriceError]);

  const handleWallet = () => {
    window.open(`${chainInfo?.blockExplorer}/address/${walletAddress}`, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    if (isError) {
      router.replace(NFT_TRANSFER_ROUTES.ERROR);
    }
  }, [isError]);

  if (isPending) {
    return (
      <Center w="full">
        <LoadingSpinner />
      </Center>
    );
  }

  return (
    <VStack w="full" gap={0}>
      <VStack gap={6}>
        <Box w={24} h={24}>
          <OwnedNftTile
            nft={{ ...(nft as unknown as OwnedNFT), balance: `${count}`, imageURL: nft?.image.originalUrl || '' }}
            balance={count}
            countPosition="bottom-right"
          />
        </Box>
        <Text
          size="lg"
          styles={{
            fontWeight: 'bold',
          }}
        >
          {nft?.name ?? '(Unknown)'}
        </Text>
      </VStack>

      <Spacer mt={6} />

      <VStack w="full" gap={2} alignItems="flex-start">
        <HStack w="full" justifyContent="space-between">
          <Text size="sm" styles={{ fontWeight: 500 }}>
            {t('Send to')}
          </Text>
          <HStack role="button" gap={2} onClick={handleWallet} cursor="pointer">
            <Text size="sm">{truncateAddress(to ?? '')}</Text>
            <GradientCircle walletAddress={to} />
          </HStack>
        </HStack>

        <Divider borderColor="ink.20" />

        <HStack w="full" justifyContent="space-between">
          <Text size="sm" styles={{ fontWeight: 500 }}>
            {t('Network')}
          </Text>
          <HStack>
            <Text
              size="sm"
              styles={{
                color: token(chainInfo?.isMainnet ? 'colors.text.primary' : 'colors.gold.50'),
              }}
            >
              {chainInfo?.networkName}
            </Text>
            <BlockChainIcon width={20} height={20} />
          </HStack>
        </HStack>

        <Divider borderColor="ink.20" />

        <HStack w="full" justifyContent="space-between">
          <HStack gap={1.5}>
            <Text size="sm" styles={{ fontWeight: 500 }}>
              {t('Network fee')}
            </Text>
            <Tooltip
              content={t(
                'This processing fee applies to all blockchain transactions. Prices vary based on network traffic.',
              )}
            >
              <IcoQuestionCircleFill
                className={css({
                  color: 'text.tertiary',
                  w: 4,
                  h: 4,
                })}
              />
            </Tooltip>
          </HStack>

          {priceInUsd}
        </HStack>
      </VStack>
    </VStack>
  );
};
