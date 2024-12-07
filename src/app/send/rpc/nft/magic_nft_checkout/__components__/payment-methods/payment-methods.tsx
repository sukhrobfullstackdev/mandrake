'use client';

import { NftImage } from '@app/send/rpc/nft/magic_nft_checkout/__components__/nft-image';
import { CostBreakdownBottomSheet } from '@app/send/rpc/nft/magic_nft_checkout/__components__/payment-methods/cost-breakdown-bottom-sheet';
import { InsufficientBalanceBottomSheet } from '@app/send/rpc/nft/magic_nft_checkout/__components__/payment-methods/insufficient-balance-bottom-sheet';
import { PaypalButton } from '@app/send/rpc/nft/magic_nft_checkout/__components__/payment-methods/paypal-button';
import { PaypalPending } from '@app/send/rpc/nft/magic_nft_checkout/__components__/payment-methods/paypal-pending';
import { SendingTo } from '@app/send/rpc/nft/magic_nft_checkout/__components__/payment-methods/sending-to';
import { useCostBreakdown } from '@app/send/rpc/nft/magic_nft_checkout/__hooks__/use-cost-breakdown';
import { useMintNftWithWeb3Modal } from '@app/send/rpc/nft/magic_nft_checkout/__hooks__/use-mint-nft-with-web3modal';
import { useNftCheckoutContext } from '@app/send/rpc/nft/magic_nft_checkout/nft-checkout-context';
import { NFT_CHECKOUT_STATUS, WALLET_PROVIDERS } from '@constants/nft';
import { useFlags } from '@hooks/common/launch-darkly';
import { useBalance } from '@hooks/data/embedded/block';
import { useNftCheckoutPayload, useNftTokenInfo } from '@hooks/data/embedded/nft';
import { useTranslation } from '@lib/common/i18n';
import { Animate, BlcEthereum, Button, Callout, IcoCreditCard, LogoEthereumMono, Text } from '@magiclabs/ui-components';
import { Box, HStack, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useCallback, useState } from 'react';
import { formatEther } from 'viem';

export const PaymentMethods = () => {
  const { t } = useTranslation('send');
  const [isInsufficientBalanceOpened, setIsInsufficientBalanceOpened] = useState(false);
  const [isCostBreakdownOpened, setIsCostBreakdownOpened] = useState(false);

  const { isPaypalPending, setStatus } = useNftCheckoutContext();

  const flags = useFlags();

  const { nftCheckoutPayload } = useNftCheckoutPayload();
  const { data: nftTokenInfo } = useNftTokenInfo({
    contractId: nftCheckoutPayload.contractId,
    tokenId: nftCheckoutPayload.tokenId,
  });

  const { totalInUsd, total } = useCostBreakdown();
  const { balance } = useBalance({
    chainId: nftTokenInfo.contractChainId,
    address: nftCheckoutPayload.walletAddress ?? '',
  });

  const { mutateAsync: mintNft, isPending } = useMintNftWithWeb3Modal();

  const handleEthereum = useCallback(async () => {
    const balanceInUsd = +formatEther(balance) * nftTokenInfo.usdRate;

    if (balanceInUsd < total) {
      setIsInsufficientBalanceOpened(true);
      return;
    }

    if (nftCheckoutPayload.walletProvider === WALLET_PROVIDERS.WEB3MODAL) {
      try {
        await mintNft();
      } catch (error) {
        logger.error('Error minting NFT', error);
        throw error;
      }
      return;
    }

    setStatus(NFT_CHECKOUT_STATUS.CRYPTO_CHECKOUT);
  }, [balance, nftTokenInfo.price]);

  const handleCard = (): void => {
    setStatus(NFT_CHECKOUT_STATUS.CARD_PAYMENT);
  };

  return (
    <>
      <InsufficientBalanceBottomSheet
        isOpened={isInsufficientBalanceOpened}
        setIsOpened={setIsInsufficientBalanceOpened}
      />
      <CostBreakdownBottomSheet isOpened={isCostBreakdownOpened} setIsOpened={setIsCostBreakdownOpened} />
      {!isPaypalPending && <SendingTo />}
      <VStack
        w="full"
        pos="relative"
        minH="19.875rem"
        gap={10}
        {...(isPaypalPending && {
          height: '10.5rem',
          minH: '10.5rem',
          overflow: 'hidden',
        })}
      >
        {isPaypalPending && <PaypalPending />}
        <Animate type="slide" asChild>
          <VStack w="full" gap={6} pt={20} overflow="hidden">
            <VStack gap={4} w="full">
              <HStack width="100%" gap={4}>
                <NftImage src={nftCheckoutPayload.imageUrl} width={80} height={80} />
                <VStack alignItems="flex-start" gap={2}>
                  <Text.H3>{nftCheckoutPayload.name}</Text.H3>
                  <VStack gap={1} alignItems="flex-start">
                    <HStack gap={2}>
                      <Text
                        size="lg"
                        styles={{
                          fontWeight: 500,
                        }}
                      >
                        {totalInUsd}
                      </Text>
                      <Box w={1} h={1} borderRadius="full" bgColor="neutral.primary" />
                      <Text
                        size="lg"
                        styles={{
                          fontWeight: 500,
                        }}
                      >
                        {nftTokenInfo.price} {nftTokenInfo.denomination}
                      </Text>
                    </HStack>
                  </VStack>
                </VStack>
              </HStack>

              {/* banner */}
              <VStack role="button" onClick={() => setIsCostBreakdownOpened(true)} w="full" cursor="pointer">
                <Callout size="sm" variant="neutral" icon={true} label={t('$USD price includes service fees')} />
              </VStack>
            </VStack>

            {flags?.isForbesUiEnabled ? (
              <VStack gap={3} width="full">
                <Button
                  expand
                  label="Ethereum"
                  variant="primary"
                  disabled={isPending}
                  validating={isPending}
                  onPress={handleEthereum}
                >
                  <Button.LeadingIcon>
                    <LogoEthereumMono />
                  </Button.LeadingIcon>
                </Button>
                <PaypalButton disabled={isPending} />
                <Button
                  expand
                  label={t('Credit or Debit')}
                  variant="tertiary"
                  disabled={isPending}
                  onPress={handleCard}
                >
                  <Button.LeadingIcon color={token('colors.text.primary')}>
                    <IcoCreditCard />
                  </Button.LeadingIcon>
                </Button>
              </VStack>
            ) : (
              <VStack gap={3} width="full">
                <PaypalButton disabled={isPending} />
                <Button expand label={t('Credit or Debit')} variant="primary" disabled={isPending} onPress={handleCard}>
                  <Button.LeadingIcon>
                    <IcoCreditCard />
                  </Button.LeadingIcon>
                </Button>
                <Button
                  expand
                  label="Ethereum"
                  variant="neutral"
                  disabled={isPending}
                  validating={isPending}
                  onPress={handleEthereum}
                >
                  <Button.LeadingIcon>
                    <BlcEthereum />
                  </Button.LeadingIcon>
                </Button>
              </VStack>
            )}
          </VStack>
        </Animate>
      </VStack>
    </>
  );
};
