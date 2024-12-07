'use client';

import { AlreadyExistsPage } from '@app/send/rpc/nft/magic_nft_checkout/__components__/already-exists/already-exists';
import { CardPayment } from '@app/send/rpc/nft/magic_nft_checkout/__components__/card-payment/card-payment';
import { ConfirmCryptoCheckout } from '@app/send/rpc/nft/magic_nft_checkout/__components__/confirm-crypto-checkout/confirm-crypto-checkout';
import { ConfirmPaypalCheckout } from '@app/send/rpc/nft/magic_nft_checkout/__components__/confirm-paypal-checkout/confirm-paypal-checkout';
import { FallbackLoading } from '@app/send/rpc/nft/magic_nft_checkout/__components__/fallback-loading';
import { ItemSoldOut } from '@app/send/rpc/nft/magic_nft_checkout/__components__/item-sold-out/item-sold-out';
import { NotAllowedPage } from '@app/send/rpc/nft/magic_nft_checkout/__components__/not-allowed/not-allowed';
import { NowAvailable } from '@app/send/rpc/nft/magic_nft_checkout/__components__/now-available/now-available';
import { OrderConfirmed } from '@app/send/rpc/nft/magic_nft_checkout/__components__/order-confirmed/order-confirmed';
import { PaymentConfirmed } from '@app/send/rpc/nft/magic_nft_checkout/__components__/payment-confirmed/payment-confirmed';
import { PaymentFailed } from '@app/send/rpc/nft/magic_nft_checkout/__components__/payment-failed/payment-failed';
import { PaymentMethods } from '@app/send/rpc/nft/magic_nft_checkout/__components__/payment-methods/payment-methods';
import { PreSaleSoldOut } from '@app/send/rpc/nft/magic_nft_checkout/__components__/pre-sale-sold-out/pre-sale-sold-out';
import { PriceEstimateExpired } from '@app/send/rpc/nft/magic_nft_checkout/__components__/price-estimate-expired/price-estimate-expired';
import { ReceiveFunds } from '@app/send/rpc/nft/magic_nft_checkout/__components__/receive-funds/receive-funds';
import { SomethingWentWrongPage } from '@app/send/rpc/nft/magic_nft_checkout/__components__/something-went-wrong/something-went-wrong';
import { SwitchCase } from '@app/send/rpc/nft/magic_nft_checkout/__components__/switch-case';
import { useCloseNftCheckout } from '@app/send/rpc/nft/magic_nft_checkout/__hooks__/use-close-nft-checkout';
import { useNftCheckoutContext } from '@app/send/rpc/nft/magic_nft_checkout/nft-checkout-context';
import { NftCheckoutHeader } from '@app/send/rpc/nft/magic_nft_checkout/nft-checkout-header';
import { ErrorBoundary } from '@components/error-boundary';
import PageFooter from '@components/show-ui/footer';
import { NFT_CHECKOUT_STATUS, WALLET_PROVIDERS } from '@constants/nft';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useNftCheckoutPayload } from '@hooks/data/embedded/nft';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { Page } from '@magiclabs/ui-components';
import { Suspense, useEffect } from 'react';

export const NftCheckoutHome = () => {
  const { isError, isComplete } = useHydrateSession();

  const { status, setStatus } = useNftCheckoutContext();
  const { closeNftCheckout } = useCloseNftCheckout();
  const { nftCheckoutPayload } = useNftCheckoutPayload();

  useEffect(() => {
    IFrameMessageService.showOverlay();
  }, []);

  useEffect(() => {
    if (isError) {
      if (nftCheckoutPayload?.walletProvider === WALLET_PROVIDERS.WEB3MODAL) {
        if (status === NFT_CHECKOUT_STATUS.HYDRATE_SESSION) {
          setStatus(NFT_CHECKOUT_STATUS.PAYMENT_METHODS);
        }
        return;
      }

      closeNftCheckout();
    }

    if (isComplete) {
      setStatus(NFT_CHECKOUT_STATUS.PAYMENT_METHODS);
    }
  }, [isError, isComplete]);

  return (
    <main>
      <Page backgroundType="blurred">
        <Page.Header>
          <NftCheckoutHeader />
        </Page.Header>

        <Page.Content>
          <ErrorBoundary
            fallback={(_, reset) => (
              <SomethingWentWrongPage
                onTryAgain={() => {
                  reset();
                }}
              />
            )}
          >
            <Suspense fallback={<FallbackLoading />}>
              <SwitchCase
                value={status}
                caseBy={{
                  [NFT_CHECKOUT_STATUS.HYDRATE_SESSION]: <FallbackLoading />,
                  [NFT_CHECKOUT_STATUS.PAYMENT_METHODS]: <PaymentMethods />,
                  [NFT_CHECKOUT_STATUS.CARD_PAYMENT]: <CardPayment />,
                  [NFT_CHECKOUT_STATUS.PAYPAL_CHECKOUT]: <ConfirmPaypalCheckout />,
                  [NFT_CHECKOUT_STATUS.CRYPTO_CHECKOUT]: <ConfirmCryptoCheckout />,
                  [NFT_CHECKOUT_STATUS.PAYMENT_CONFIRMED]: <PaymentConfirmed />,
                  [NFT_CHECKOUT_STATUS.ORDER_CONFIRMED]: <OrderConfirmed />,
                  [NFT_CHECKOUT_STATUS.NOW_AVAILABLE]: <NowAvailable />,
                  [NFT_CHECKOUT_STATUS.ITEM_SOLD_OUT]: <ItemSoldOut />,
                  [NFT_CHECKOUT_STATUS.PRE_SALE_SOLD_OUT]: <PreSaleSoldOut />,
                  [NFT_CHECKOUT_STATUS.PRICE_ESTIMATE_EXPIRED]: <PriceEstimateExpired />,
                  [NFT_CHECKOUT_STATUS.PAYMENT_FAILED]: <PaymentFailed />,
                  [NFT_CHECKOUT_STATUS.ALREADY_EXISTS]: <AlreadyExistsPage />,
                  [NFT_CHECKOUT_STATUS.NOT_ALLOWED]: <NotAllowedPage />,
                  [NFT_CHECKOUT_STATUS.SOMETHING_WENT_WRONG]: <SomethingWentWrongPage />,
                  [NFT_CHECKOUT_STATUS.RECEIVE_FUNDS]: <ReceiveFunds />,
                }}
                defaultComponent={<SomethingWentWrongPage />}
              />
            </Suspense>
          </ErrorBoundary>
        </Page.Content>
        <PageFooter />
      </Page>
    </main>
  );
};
