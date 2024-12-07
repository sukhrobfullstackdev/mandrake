'use client';

import { BrandCard } from '@app/send/rpc/nft/magic_nft_checkout/__components__/card-payment/brand-card';
import { PayerEmail } from '@app/send/rpc/nft/magic_nft_checkout/__components__/confirm-paypal-checkout/payer-email';
import { NftImage } from '@app/send/rpc/nft/magic_nft_checkout/__components__/nft-image';
import { CostBreakdownBottomSheet } from '@app/send/rpc/nft/magic_nft_checkout/__components__/payment-methods/cost-breakdown-bottom-sheet';
import { useCostBreakdown } from '@app/send/rpc/nft/magic_nft_checkout/__hooks__/use-cost-breakdown';
import { useHasSufficientInventory } from '@app/send/rpc/nft/magic_nft_checkout/__hooks__/use-has-sufficient-inventory';
import { useNftCheckoutContext } from '@app/send/rpc/nft/magic_nft_checkout/nft-checkout-context';
import { NFT_CHECKOUT_STATUS, PAYPAL_ERROR_MESSAGES, WALLET_PROVIDERS } from '@constants/nft';
import { useFlags } from '@hooks/common/launch-darkly';
import {
  useBalanceOfNft,
  useCurrentStage,
  useIsAllowList,
  useNftCheckoutPayload,
  useNftTokenInfo,
} from '@hooks/data/embedded/nft';
import { authorizeOrder } from '@hooks/data/embedded/nft/fetchers';
import { useStore } from '@hooks/store';
import { useTranslation } from '@lib/common/i18n';
import { copyToClipboard } from '@lib/utils/copy';
import { truncateEmail } from '@lib/utils/nft-checkout';
import {
  Animate,
  Button,
  IcoInfoCircleFill,
  IcoWallet,
  IconMagicLogo,
  Text,
  WalletAddress,
} from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, Divider, HStack, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const ERROR_MESSAGES = {
  ITEM_SOLD_OUT: 'Item is sold out',
  ORDER_ID_REQUIRED: 'Order ID is required',
};

export function ConfirmPaypalCheckout() {
  const { t } = useTranslation('send');
  const search = useSearchParams();
  const orderId = search.get('orderId');
  const brandType = search.get('brandType');
  const last4 = search.get('last4');
  const [isOpened, setIsOpened] = useState(false);
  const { setStatus } = useNftCheckoutContext();

  const email = useStore(state => state.email);
  const { nftCheckoutPayload } = useNftCheckoutPayload();
  const { data: nftTokenInfo } = useNftTokenInfo({
    contractId: nftCheckoutPayload.contractId,
    tokenId: nftCheckoutPayload.tokenId,
  });

  const flags = useFlags();

  const { hasSufficientInventory } = useHasSufficientInventory();
  const { data: balanceOfNft } = useBalanceOfNft({
    chainId: nftTokenInfo.contractChainId,
    contractAddress: nftTokenInfo.contractAddress,
    owner: nftCheckoutPayload.walletAddress ?? '',
  });
  const { data: isAllowList } = useIsAllowList({
    chainId: nftTokenInfo.contractChainId,
    contractAddress: nftTokenInfo.contractAddress,
    address: nftCheckoutPayload.walletAddress ?? '',
  });
  const { data: currentStage } = useCurrentStage({
    chainId: nftTokenInfo.contractChainId,
    contractAddress: nftTokenInfo.contractAddress,
  });

  const { totalInUsd } = useCostBreakdown();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: () => {
      if (!orderId) {
        throw new Error(ERROR_MESSAGES.ORDER_ID_REQUIRED);
      }

      if (!hasSufficientInventory) {
        throw new Error(ERROR_MESSAGES.ITEM_SOLD_OUT);
      }

      if (balanceOfNft > 0) {
        throw new Error(NFT_CHECKOUT_STATUS.ALREADY_EXISTS);
      }

      if (!isAllowList || currentStage === 0) {
        throw new Error(NFT_CHECKOUT_STATUS.NOT_ALLOWED);
      }

      return authorizeOrder({ orderId });
    },
    onSuccess: response => {
      const queryParams = new URLSearchParams(search);
      queryParams.append('requestId', response.requestId);
      window.history.pushState(null, '', `?${queryParams.toString()}`);

      setStatus(NFT_CHECKOUT_STATUS.ORDER_CONFIRMED);
    },
    onError: error => {
      logger.error('Failed to authorize order', { orderId }, error);
      if (error.message === NFT_CHECKOUT_STATUS.ITEM_SOLD_OUT) {
        setStatus(NFT_CHECKOUT_STATUS.ITEM_SOLD_OUT);
        return;
      }

      if (error.message === NFT_CHECKOUT_STATUS.ALREADY_EXISTS) {
        setStatus(NFT_CHECKOUT_STATUS.ALREADY_EXISTS);
        return;
      }

      if (error.message === NFT_CHECKOUT_STATUS.NOT_ALLOWED) {
        setStatus(NFT_CHECKOUT_STATUS.NOT_ALLOWED);
        return;
      }

      if (error.message === PAYPAL_ERROR_MESSAGES.FAILED_TO_GET_TOKEN_INFO) {
        setStatus(NFT_CHECKOUT_STATUS.PAYMENT_FAILED);
        return;
      }

      setStatus(NFT_CHECKOUT_STATUS.PRICE_ESTIMATE_EXPIRED);
    },
  });

  useEffect(() => {
    if (!orderId) {
      setStatus(NFT_CHECKOUT_STATUS.SOMETHING_WENT_WRONG);
    }
  }, []);

  return (
    <>
      <CostBreakdownBottomSheet isOpened={isOpened} setIsOpened={setIsOpened} />
      <Animate type="slide" asChild>
        <VStack gap={0} w="full" mt={4}>
          <VStack gap={3}>
            <NftImage src={nftCheckoutPayload.imageUrl} />
            <VStack gap={2}>
              <Text styles={{ fontSize: '1.5rem', lineHeight: 1.5, fontWeight: 700 }}>{t('Confirm Purchase')}</Text>
              <Text size="lg">{nftCheckoutPayload.name}</Text>
            </VStack>
          </VStack>

          <VStack w="full" gap={0} my={5}>
            {!flags?.isForbesUiEnabled && (
              <>
                <HStack w="full" h={12} justifyContent="space-between" alignItems="center">
                  <Text size="sm" styles={{ fontWeight: 500 }}>
                    {t('Quantity')}
                  </Text>
                  <HStack gap={3}>
                    <Text size="sm">{nftCheckoutPayload.quantity ?? 1}</Text>
                  </HStack>
                </HStack>
                <Divider color="neutral.tertiary" />
              </>
            )}
            <HStack w="full" h={12} justifyContent="space-between" alignItems="center">
              <HStack alignItems="center" gap={2}>
                <Text size="sm" styles={{ fontWeight: 500 }}>
                  {t('Total Price')}
                </Text>
                <IcoInfoCircleFill
                  role="button"
                  onClick={() => setIsOpened(true)}
                  className={css({
                    color: 'text.tertiary',
                    cursor: 'pointer',
                    w: 4,
                    h: 4,
                  })}
                />
              </HStack>
              <HStack gap={3}>
                <Text size="sm" styles={{ fontWeight: 700 }}>
                  {totalInUsd}
                </Text>
              </HStack>
            </HStack>
            <Divider color="neutral.tertiary" />
            <HStack w="full" h={12} justifyContent="space-between" alignItems="center">
              <Text size="sm" styles={{ fontWeight: 500 }}>
                {t('Payment')}
              </Text>
              {brandType ? (
                <HStack gap={3}>
                  <HStack gap={1}>
                    {Array.from({ length: 4 }, (_, index) => (
                      <Box key={index} w={1} h={1} bgColor="text.tertiary" borderRadius="full" />
                    ))}
                    <Text size="sm">{last4}</Text>
                  </HStack>
                  <BrandCard type={brandType} />
                </HStack>
              ) : (
                orderId && <PayerEmail orderId={orderId} />
              )}
            </HStack>
            <Divider color="neutral.tertiary" />
            <HStack w="full" h={12} justifyContent="space-between" alignItems="center">
              <Text size="sm" styles={{ fontWeight: 500 }}>
                {t('Send to')}
              </Text>
              {nftCheckoutPayload?.walletProvider === WALLET_PROVIDERS.WEB3MODAL ? (
                <HStack gap={2}>
                  <WalletAddress
                    address={nftCheckoutPayload.walletAddress ?? ''}
                    onCopy={(value: string) => copyToClipboard(value)}
                  />
                  <IcoWallet color={token('colors.text.secondary')} width={20} height={20} />
                </HStack>
              ) : (
                <HStack gap={3}>
                  <Text size="sm">{truncateEmail(email ?? '', 22)}</Text>
                  <IconMagicLogo width={24} height={24} />
                </HStack>
              )}
            </HStack>
          </VStack>

          <Button
            expand
            onPress={() => mutateAsync()}
            label={t('Buy Now')}
            validating={isPending}
            disabled={isPending}
          />
        </VStack>
      </Animate>
    </>
  );
}
