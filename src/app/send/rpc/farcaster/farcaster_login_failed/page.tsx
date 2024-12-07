'use client';

import PageFooter from '@components/show-ui/footer';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useSendRouter } from '@hooks/common/send-router';
import { useTranslation } from '@lib/common/i18n';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { Button, Header, IcoDismiss, IcoDismissCircleFill, Page, Text } from '@magiclabs/ui-components';
import { HStack, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useEffect } from 'react';

export default function FarcasterLoginFailed() {
  const { t } = useTranslation('send');
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const { replace } = useSendRouter();

  const handleClose = () => {
    rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserCanceledAction, undefined, {
      closedByUser: true,
    });
  };

  const handleTryAgain = () => {
    replace(`/send/rpc/farcaster/farcaster_show_QR`);
  };

  useEffect(() => {
    IFrameMessageService.showOverlay();
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
        <IcoDismissCircleFill width={48} height={48} color={token('colors.ruby.50')} />
        <VStack mt={5} gap={2} w="full">
          <Text.H4>{t('Request Denied')}</Text.H4>
          <Text styles={{ color: token('colors.text.tertiary'), textAlign: 'center' }}>
            {t('It looks like you rejected the Farcaster sign-in request. Please try again.')}
          </Text>
        </VStack>
        <HStack w="full" mt={10}>
          <Button variant="neutral" expand label={t('Cancel')} onPress={handleClose}></Button>
          <Button expand label={t('Try again')} onPress={handleTryAgain}></Button>
        </HStack>
      </Page.Content>
      <PageFooter />
    </Page>
  );
}
