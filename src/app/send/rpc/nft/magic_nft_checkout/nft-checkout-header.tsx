'use client';

import { useCloseNftCheckout } from '@app/send/rpc/nft/magic_nft_checkout/__hooks__/use-close-nft-checkout';
import { useNftCheckoutContext } from '@app/send/rpc/nft/magic_nft_checkout/nft-checkout-context';
import { NFT_CHECKOUT_STATUS, WALLET_PROVIDERS } from '@constants/nft';
import { useSendRouter } from '@hooks/common/send-router';
import { useNftCheckoutPayload } from '@hooks/data/embedded/nft';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { useTranslation } from '@lib/common/i18n';
import { truncateEmail } from '@lib/utils/nft-checkout';
import { Button, Header, IcoArrowLeft, IcoDismiss, IcoMenu, Popover, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { token } from '@styled/tokens';

export const NftCheckoutHeader = () => {
  const { t } = useTranslation('send');
  const { status, setStatus, isPaypalPending } = useNftCheckoutContext();
  const { closeNftCheckout } = useCloseNftCheckout();
  const { nftCheckoutPayload } = useNftCheckoutPayload();
  const { email } = useStore(state => state);
  const router = useSendRouter();

  const handleLogout = () => {
    // emit intermediary event to sdk to logout third party wallet
    AtomicRpcPayloadService.emitJsonRpcEventResponse('disconnect');

    const resolveValue = JSON.stringify({ status: 'cancelled' });
    router.replace(`/send/rpc/auth/magic_auth_logout?sdkResult=${encodeURIComponent(resolveValue)}`);
  };

  return (
    <>
      <Header.LeftAction>
        {status === NFT_CHECKOUT_STATUS.CARD_PAYMENT ||
        status === NFT_CHECKOUT_STATUS.CRYPTO_CHECKOUT ||
        status === NFT_CHECKOUT_STATUS.PAYPAL_CHECKOUT ||
        status === NFT_CHECKOUT_STATUS.RECEIVE_FUNDS ||
        isPaypalPending ? (
          <Button size="sm" variant="neutral" onPress={() => setStatus(NFT_CHECKOUT_STATUS.PAYMENT_METHODS)}>
            <Button.TrailingIcon>
              <IcoArrowLeft />
            </Button.TrailingIcon>
          </Button>
        ) : (
          <Popover size="sm" variant="neutral">
            <Popover.LeadingIcon>
              <IcoMenu />
            </Popover.LeadingIcon>
            <Popover.Content>
              <Text size="sm" styles={{ color: token('colors.text.secondary') }}>
                {nftCheckoutPayload?.walletProvider === WALLET_PROVIDERS.WEB3MODAL
                  ? (nftCheckoutPayload?.walletAddress as string).slice(0, 6) +
                    '...' +
                    (nftCheckoutPayload?.walletAddress as string).slice(-4)
                  : truncateEmail(email || '', 22)}
              </Text>
              <button
                onClick={handleLogout}
                className={css({
                  color: 'text.primary',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: 'sm',
                })}
              >
                Log out
              </button>
            </Popover.Content>
          </Popover>
        )}
      </Header.LeftAction>
      <Header.RightAction>
        <Button size="sm" variant="neutral" onPress={closeNftCheckout}>
          <Button.TrailingIcon>
            <IcoDismiss />
          </Button.TrailingIcon>
        </Button>
      </Header.RightAction>
      <Header.Content>
        <Text size="sm" styles={{ color: token('colors.text.tertiary') }}>
          {status === NFT_CHECKOUT_STATUS.RECEIVE_FUNDS ? t('Receive Funds') : t('Checkout')}
        </Text>
      </Header.Content>
    </>
  );
};
