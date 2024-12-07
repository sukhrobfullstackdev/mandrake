'use client';

import { ImageWithIcon } from '@app/send/rpc/nft/magic_nft_checkout/__components__/image-with-icon';
import { NftImage } from '@app/send/rpc/nft/magic_nft_checkout/__components__/nft-image';
import { ViewTranssactionButton } from '@app/send/rpc/nft/magic_nft_checkout/__components__/payment-confirmed/view-transaction-button';
import { useInterval } from '@app/send/rpc/nft/magic_nft_checkout/__hooks__/use-interval';
import { useNftCheckoutContext } from '@app/send/rpc/nft/magic_nft_checkout/nft-checkout-context';
import { Endpoint } from '@constants/endpoint';
import { MINTING_STATUS, NFT_CHECKOUT_STATUS, REQUEST_STATUS } from '@constants/nft';
import { useNftCheckoutPayload, useNftTokenInfo } from '@hooks/data/embedded/nft';
import { useTranslation } from '@lib/common/i18n';
import { HttpService } from '@lib/http-services';
import { getViemClient } from '@lib/viem/get-viem-client';
import { Animate, IcoCheckmarkCircleFill, LoadingSpinner, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, HStack, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useSearchParams } from 'next/navigation';
import qs from 'qs';
import { useState } from 'react';

type MintingStatus = keyof typeof MINTING_STATUS;

export function OrderConfirmed() {
  const { t } = useTranslation('send');
  const { setStatus } = useNftCheckoutContext();
  const search = useSearchParams();

  const requestId = search.get('requestId');
  const orderId = search.get('orderId');
  const hash = search.get('hash');

  const { nftCheckoutPayload } = useNftCheckoutPayload();
  const { data: nftTokenInfo } = useNftTokenInfo({
    contractId: nftCheckoutPayload.contractId,
    tokenId: nftCheckoutPayload.tokenId,
  });
  const [mintingStatus, setMintingStatus] = useState<MintingStatus>(
    hash ? MINTING_STATUS.CREATING_ITEM : MINTING_STATUS.APPROVED,
  );

  useInterval(
    async () => {
      if (!requestId && !hash) {
        setStatus(NFT_CHECKOUT_STATUS.PAYMENT_FAILED);
        return;
      }

      if (mintingStatus === MINTING_STATUS.APPROVED) {
        setMintingStatus(MINTING_STATUS.CREATING_ITEM);
      } else if (mintingStatus === MINTING_STATUS.CREATING_ITEM) {
        setMintingStatus(MINTING_STATUS.PREPARING);
      } else if (mintingStatus === MINTING_STATUS.PREPARING) {
        setMintingStatus(MINTING_STATUS.DELIVERING);
      } else if (mintingStatus === MINTING_STATUS.DELIVERING) {
        if (requestId) {
          try {
            const { status: requestStatus } = await HttpService.Nft.Get(
              `${Endpoint.Nft.RequestStatus}?${qs.stringify({
                request_id: requestId,
                include_order_id: 'true',
              })}`,
            );

            if (requestStatus === REQUEST_STATUS.MINTED || requestStatus === REQUEST_STATUS.WEBHOOK_SUCCESS_SENT) {
              setMintingStatus(MINTING_STATUS.DELIVERED);
            }

            if (requestStatus === REQUEST_STATUS.MINT_FAILED || requestStatus === REQUEST_STATUS.WEBHOOK_FAILED_SENT) {
              setStatus(NFT_CHECKOUT_STATUS.SOMETHING_WENT_WRONG);
              return;
            }
          } catch (error) {
            logger.error('Error getting request status', error);
            throw error;
          }
        }

        if (hash) {
          try {
            const response = await getViemClient(nftTokenInfo.contractChainId).waitForTransactionReceipt({
              hash: hash as `0x${string}`,
            });

            if (response.status === 'success') {
              setMintingStatus(MINTING_STATUS.DELIVERED);
            } else {
              setStatus(NFT_CHECKOUT_STATUS.SOMETHING_WENT_WRONG);
            }
          } catch (error) {
            logger.error('Error getting transaction receipt', error);
            throw error;
          }
        }
      } else if (mintingStatus === MINTING_STATUS.DELIVERED) {
        setMintingStatus(MINTING_STATUS.DONE);
        setStatus(NFT_CHECKOUT_STATUS.NOW_AVAILABLE);
      }
    },
    mintingStatus === MINTING_STATUS.DONE ? null : 2000,
  );

  return (
    <Animate type="slide" asChild>
      <VStack gap={0} w="full" mt={4}>
        {mintingStatus === MINTING_STATUS.APPROVED ? (
          <ImageWithIcon src={nftCheckoutPayload.imageUrl} alt="Thumbnail" width={96} height={96}>
            <IcoCheckmarkCircleFill width={40} height={40} color="white" />
          </ImageWithIcon>
        ) : (
          <NftImage src={nftCheckoutPayload.imageUrl} width={144} height={144} />
        )}

        <Box mt={6}>
          <Text size="lg" styles={{ fontWeight: 700, fontSize: '1.25rem' }}>
            {t('Order confirmed')}
          </Text>
        </Box>

        {mintingStatus === MINTING_STATUS.APPROVED ? (
          <Box mt={2}>
            <Text size="lg" styles={{ textAlign: 'center' }}>
              {t('Payment approved')}
            </Text>
          </Box>
        ) : (
          <>
            <VStack gap={4} w="full" mt={6}>
              <VStack w="full" p={4} borderRadius="xl" bgColor="neutral.quaternary">
                <HStack gap={2.5}>
                  {mintingStatus === MINTING_STATUS.DELIVERED || mintingStatus === MINTING_STATUS.DONE ? (
                    <IcoCheckmarkCircleFill
                      className={css({
                        color: 'text.primary',
                        w: 6,
                        h: 6,
                      })}
                    />
                  ) : (
                    <LoadingSpinner size={20} strokeWidth={2.5} neutral />
                  )}
                  {mintingStatus === MINTING_STATUS.CREATING_ITEM && (
                    <Text size="md" styles={{ fontWeight: 600 }}>
                      {t('Creating item')}
                    </Text>
                  )}
                  {mintingStatus === MINTING_STATUS.PREPARING && (
                    <Text size="md" styles={{ fontWeight: 600 }}>
                      {t('Preparing for delivery')}
                    </Text>
                  )}
                  {mintingStatus === MINTING_STATUS.DELIVERING && (
                    <Text size="md" styles={{ fontWeight: 600 }}>
                      {t('Delivering item')}
                    </Text>
                  )}
                  {(mintingStatus === MINTING_STATUS.DELIVERED || mintingStatus === MINTING_STATUS.DONE) && (
                    <Text size="md" styles={{ fontWeight: 600 }}>
                      {t('Item delivered')}
                    </Text>
                  )}
                </HStack>
                <VStack
                  opacity={
                    mintingStatus === MINTING_STATUS.DELIVERED || mintingStatus === MINTING_STATUS.DONE ? 0.3 : 1
                  }
                >
                  <Text
                    size="sm"
                    styles={{
                      textAlign: 'center',
                    }}
                  >
                    <span
                      className={css({
                        color: 'text.tertiary',
                      })}
                    >
                      {t('Delivery may take a few minutes.')}
                      <br />
                      {t('You can safely close this window.')}
                    </span>
                  </Text>
                </VStack>
              </VStack>

              {orderId && (
                <Text
                  size="md"
                  styles={{
                    color: token('colors.text.tertiary'),
                  }}
                >
                  {t('Order ID')}: {orderId}
                </Text>
              )}

              {hash && <ViewTranssactionButton hash={hash} chainId={nftTokenInfo.contractChainId} />}
            </VStack>
          </>
        )}
      </VStack>
    </Animate>
  );
}
