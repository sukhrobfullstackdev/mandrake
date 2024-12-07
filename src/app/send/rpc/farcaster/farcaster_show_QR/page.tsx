'use client';

import PageFooter from '@components/show-ui/footer';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { createAppClient, viemConnector } from '@farcaster/auth-client';
import { useSetAuthState } from '@hooks/common/auth-state';
import { useCreateDidTokenForUser } from '@hooks/common/create-did-token-for-user';
import { useHydrateOrCreateWallets } from '@hooks/common/hydrate-or-create-wallets';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useSendRouter } from '@hooks/common/send-router';
import { UseFarcasterLoginParams, useFarcasterLoginMutation } from '@hooks/data/embedded/farcaster-login';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { useTranslation } from '@lib/common/i18n';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { copyToClipboard } from '@lib/utils/copy';
import { isMobileUserAgent } from '@lib/utils/platform';
import { Button, Header, IcoCheckmark, IcoCopy, IcoDismiss, Page, QRCode, Text } from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

const FARCASTER_BRAND_COLOR = `#855DCD`;
const DEFAULT_TIMEOUT = 60000;
const DEFAULT_INTERVAL = 500;

const appClient = createAppClient({
  ethereum: viemConnector(),
});

export default function FarcasterShowQR() {
  const { t } = useTranslation('send');
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const { replace } = useSendRouter();

  const payload = activeRpcPayload!.params[0];
  const { showUI, channel } = payload.data;

  const { url, channelToken } = channel;

  const { mutateAsync: mutateFarcasterLoginAsync } = useFarcasterLoginMutation();
  const { hydrateAndPersistAuthState } = useSetAuthState();

  const { areWalletsCreated, walletCreationError } = useHydrateOrCreateWallets();
  const { didToken } = useCreateDidTokenForUser({
    enabled: !walletCreationError && areWalletsCreated,
  });

  const client = useQueryClient();

  const { data } = useQuery({
    queryKey: ['farcaster_channel'],
    queryFn: async () => {
      try {
        AtomicRpcPayloadService.emitJsonRpcEventResponse('channel', [channel]);

        const { data: result } = await appClient.watchStatus({
          channelToken,
          timeout: DEFAULT_TIMEOUT,
          interval: DEFAULT_INTERVAL,
        });

        if (result?.state !== 'completed') {
          throw new Error('Failed to sign in');
        }

        const params: UseFarcasterLoginParams = {
          channel_token: channelToken,
          fid: result.fid!,
          message: result.message!,
          signature: result.signature!,
          username: result.username!,
        };

        const res = await mutateFarcasterLoginAsync(params);

        await hydrateAndPersistAuthState(res);

        AtomicRpcPayloadService.emitJsonRpcEventResponse('success', [result]);

        return result;
      } catch (e) {
        AtomicRpcPayloadService.emitJsonRpcEventResponse('failed', [e]);
        replace(`/send/rpc/farcaster/farcaster_login_failed`);
        return false;
      }
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data && didToken) {
      replace(`/send/rpc/farcaster/farcaster_login_success?${new URLSearchParams({ username: data.username! })}`);
      client.setQueryData(['didToken'], didToken);
    }
  }, [data, didToken]);

  const rejectActiveRpcRequest = useRejectActiveRpcRequest();

  const handleClose = () => {
    rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserCanceledAction, undefined, {
      closedByUser: true,
    });
  };

  useEffect(() => {
    if (showUI && !isMobileUserAgent() && url) {
      IFrameMessageService.showOverlay();
    } else {
      IFrameMessageService.hideOverlay();
    }
  }, [url]);

  const [isCopied, setIsCopied] = useState(false);

  const handleCopytoClipboard = useCallback(() => {
    copyToClipboard(url);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1500);
  }, []);

  return (
    <Page backgroundType="blurred">
      <Page.Header>
        <Header.RightAction>
          <Button size="sm" variant="neutral" onPress={handleClose}>
            <Button.TrailingIcon>
              <IcoDismiss />
            </Button.TrailingIcon>
          </Button>
        </Header.RightAction>
      </Page.Header>
      <Page.Content>
        <QRCode
          qrStyle="fluid"
          size={262}
          eyeColor={FARCASTER_BRAND_COLOR}
          value={url}
          quietZone={14.5}
          logoImage="https://bafybeidkwvzd7ae6jsi23qztuuhvpextec5qks7dv2weww6c7olgeqqx7q.ipfs.dweb.link"
          logoHeight={64}
          logoWidth={64}
          logoPadding={16}
        />
        <VStack mt="1.375rem" gap={2}>
          <Text.H4>{t('Sign in with Farcaster')}</Text.H4>
          <VStack maxW={304}>
            <Text styles={{ color: token('colors.text.tertiary'), textAlign: 'center' }}>
              {t('Scan the QR code with your phone or enter the link on a mobile browser')}
            </Text>
          </VStack>
          <VStack mt={4}>
            <Button
              size="md"
              variant="neutral"
              onPress={handleCopytoClipboard}
              label={isCopied ? t('Copied!') : t('Copy link')}
            >
              <Button.LeadingIcon>{isCopied ? <IcoCheckmark /> : <IcoCopy />}</Button.LeadingIcon>
            </Button>
          </VStack>
        </VStack>
      </Page.Content>
      <PageFooter />
    </Page>
  );
}
