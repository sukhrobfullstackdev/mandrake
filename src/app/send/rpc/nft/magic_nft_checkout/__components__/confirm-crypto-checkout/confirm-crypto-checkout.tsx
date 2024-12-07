'use client';

import { NftImage } from '@app/send/rpc/nft/magic_nft_checkout/__components__/nft-image';
import { SendingTo } from '@app/send/rpc/nft/magic_nft_checkout/__components__/payment-methods/sending-to';
import { useMintNft } from '@app/send/rpc/nft/magic_nft_checkout/__hooks__/use-mint-nft';
import { useFlags } from '@hooks/common/launch-darkly';
import { useNetworkFee, useNftCheckoutPayload, useNftTokenInfo } from '@hooks/data/embedded/nft';
import { useTranslation } from '@lib/common/i18n';
import { toEtherFixed, toUsd } from '@lib/utils/nft-checkout';
import { Animate, Button, IcoQuestionCircleFill, LoadingSpinner, Text, Tooltip } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Divider, HStack, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useMemo } from 'react';

export function ConfirmCryptoCheckout() {
  const { t } = useTranslation('send');
  const { nftCheckoutPayload } = useNftCheckoutPayload();
  const { data: nftTokenInfo } = useNftTokenInfo({
    contractId: nftCheckoutPayload.contractId,
    tokenId: nftCheckoutPayload.tokenId,
  });

  const { data: networkFee, isPending: isNetworkFeePending } = useNetworkFee({
    chainId: nftTokenInfo.contractChainId,
    quantity: nftCheckoutPayload.quantity ?? 1,
    address: nftCheckoutPayload.walletAddress ?? '',
    contractAddress: nftTokenInfo.contractAddress,
    functionName: nftTokenInfo.contractCryptoMintFunction,
    tokenId: nftCheckoutPayload.tokenId,
    tokenType: nftTokenInfo.contractType,
    value: nftTokenInfo.price,
  });

  const flags = useFlags();

  const [priceInUsd, networkFeeInUsd, totalPrice, totalPriceInUsd] = useMemo(() => {
    const price = nftTokenInfo.price * nftTokenInfo.usdRate * (nftCheckoutPayload.quantity ?? 1);
    const fee = networkFee ? +networkFee * nftTokenInfo.usdRate : 0;
    const total = nftTokenInfo.price + +(networkFee ?? 0);
    return [toUsd(price), toUsd(fee), total, toUsd(price + fee)];
  }, [nftTokenInfo, nftCheckoutPayload, networkFee]);

  const { mintNft, isPending } = useMintNft();

  return (
    <>
      <SendingTo />
      <Animate type="slide" asChild>
        <VStack w="full" gap={0} mt={16}>
          <VStack gap={6}>
            <NftImage src={nftCheckoutPayload.imageUrl} />
            <VStack gap={2}>
              <Text.H3 styles={{ lineHeight: 1.5 }}>{t('Confirm Purchase')}</Text.H3>
              <Text size="lg">{nftCheckoutPayload.name}</Text>
            </VStack>
          </VStack>

          <VStack w="full" gap={3} mb={8} mt={6}>
            {!flags?.isForbesUiEnabled && (
              <HStack w="full" justifyContent="space-between" alignItems="center">
                <Text size="md" styles={{ fontWeight: 500 }}>
                  {t('Quantity')}
                </Text>
                <HStack gap={3}>
                  <Text size="md">1</Text>
                </HStack>
              </HStack>
            )}
            <HStack w="full" justifyContent="space-between" alignItems="center">
              <Text size="md" styles={{ fontWeight: 500 }}>
                {t('Price')}
              </Text>
              <HStack gap={3}>
                <Text size="md" styles={{ color: token('colors.text.tertiary') }}>
                  {toEtherFixed(nftTokenInfo.price)} {nftTokenInfo.denomination}
                </Text>
                <Text size="md">{priceInUsd}</Text>
              </HStack>
            </HStack>
            <HStack w="full" justifyContent="space-between" alignItems="center">
              <HStack gap={1.5}>
                <Text size="md" styles={{ fontWeight: 500 }}>
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
              {isNetworkFeePending ? (
                <LoadingSpinner size={20} strokeWidth={2.5} neutral />
              ) : (
                <HStack gap={3}>
                  <Text size="md" styles={{ color: token('colors.text.tertiary') }}>
                    {toEtherFixed(networkFee)} {nftTokenInfo.denomination}
                  </Text>
                  <Text size="md">{networkFeeInUsd}</Text>
                </HStack>
              )}
            </HStack>
            <Divider color="neutral.tertiary" />
            <HStack w="full" justifyContent="space-between" alignItems="center">
              <Text size="md" styles={{ fontWeight: 500 }}>
                {t('Total')}
              </Text>
              <HStack gap={3}>
                <Text size="md" styles={{ color: token('colors.text.tertiary') }}>
                  {toEtherFixed(totalPrice)} {nftTokenInfo.denomination}
                </Text>
                <Text size="md">{totalPriceInUsd}</Text>
              </HStack>
            </HStack>
          </VStack>

          <Button
            type="submit"
            expand
            onPress={() =>
              mintNft({
                chainId: nftTokenInfo.contractChainId,
                quantity: nftCheckoutPayload.quantity ?? 1,
                contractAddress: nftTokenInfo.contractAddress,
                functionName: nftTokenInfo.contractCryptoMintFunction,
                tokenId: nftCheckoutPayload.tokenId,
                tokenType: nftTokenInfo.contractType,
                value: nftTokenInfo.price,
              })
            }
            disabled={isPending || isNetworkFeePending}
            validating={isPending}
            label={t('Buy Now')}
          />
        </VStack>
      </Animate>
    </>
  );
}
