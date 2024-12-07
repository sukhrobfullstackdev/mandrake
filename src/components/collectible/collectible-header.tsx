'use client';

import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { NFT_TRANSFER_ROUTES } from '@constants/nft';
import { useChainInfo } from '@hooks/common/chain-info';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useSendRouter } from '@hooks/common/send-router';
import { useTranslation } from '@lib/common/i18n';
import { Button, Header, IcoArrowLeft, IcoDismiss, IcoWallet, Page, Text } from '@magiclabs/ui-components';
import { token } from '@styled/tokens';
import { usePathname, useSearchParams } from 'next/navigation';

type Props = {
  count?: number;
};

export default function CollectibleHeader({ count = 1 }: Props) {
  const { t } = useTranslation('send');
  const pathname = usePathname();
  const router = useSendRouter();
  const searchParams = useSearchParams();
  const { chainInfo } = useChainInfo();

  const contractAddress = searchParams.get('contractAddress');
  const tokenId = searchParams.get('tokenId');

  const rejectActiveRpcRequest = useRejectActiveRpcRequest();

  const handleBack = () => {
    if (!contractAddress || !tokenId) {
      return;
    }

    if (pathname === NFT_TRANSFER_ROUTES.PREVIEW) {
      router.replace(
        `${NFT_TRANSFER_ROUTES.COMPOSE}?${new URLSearchParams({
          contractAddress,
          tokenId,
        })}`,
      );
      return;
    }

    if (pathname === NFT_TRANSFER_ROUTES.CONFIRM) {
      router.replace('/send/rpc/wallet/magic_wallet/home');
      return;
    }

    router.replace(
      `/send/rpc/wallet/magic_wallet/collectible_details?${new URLSearchParams({
        contractAddress,
        tokenId,
      })}`,
    );
  };

  const handleClose = () => {
    rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserCanceledAction);
  };

  return (
    <Page.Header>
      <Header.LeftAction>
        <Button variant="neutral" size="sm" onPress={handleBack} aria-label="navigate back" key="neutral-left-button">
          <Button.LeadingIcon>
            {pathname === NFT_TRANSFER_ROUTES.CONFIRM ? <IcoWallet /> : <IcoArrowLeft />}
          </Button.LeadingIcon>
        </Button>
      </Header.LeftAction>

      {pathname === NFT_TRANSFER_ROUTES.CONFIRM ? (
        <Header.Content>
          <Text size="sm" styles={{ color: token('colors.text.tertiary') }}>
            {chainInfo?.networkName}
          </Text>
        </Header.Content>
      ) : (
        <Header.Content>
          <Text size="sm" styles={{ color: token('colors.text.tertiary') }}>
            {count > 1
              ? t('Send {{coundt}} Collectibles', {
                  count,
                })
              : t('Send Collectible')}
          </Text>
        </Header.Content>
      )}

      <Header.RightAction>
        <Button variant={'neutral'} key={'neutral-right-button'} size="sm" onPress={handleClose} aria-label="close">
          <Button.TrailingIcon>
            <IcoDismiss />
          </Button.TrailingIcon>
        </Button>
      </Header.RightAction>
    </Page.Header>
  );
}
