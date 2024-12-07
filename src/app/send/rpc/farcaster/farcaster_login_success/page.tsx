'use client';

import PageFooter from '@components/show-ui/footer';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useTranslation } from '@lib/common/i18n';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { Button, Header, IcoCheckmarkCircleFill, IcoDismiss, Page, Text } from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function FarcasterLoginSuccess() {
  const { t } = useTranslation('send');
  const username = useSearchParams().get('username');
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();

  const handleClose = () => {
    rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserCanceledAction, undefined, {
      closedByUser: true,
    });
  };

  const client = useQueryClient();

  useEffect(() => {
    IFrameMessageService.showOverlay();
    setTimeout(() => {
      const didToken = client.getQueryData<string>(['didToken']);
      if (didToken) {
        resolveActiveRpcRequest(didToken);
      } else {
        rejectActiveRpcRequest(RpcErrorCode.InternalError);
      }
    }, 1800);
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
        <IcoCheckmarkCircleFill width={48} height={48} color={token('colors.brand.base')} />
        <VStack mt={5} gap={2} w="full">
          <Text.H4>{t('You’re all set')}</Text.H4>
          <Text styles={{ color: token('colors.text.tertiary'), textAlign: 'center' }}>
            {t('Successfully signed in with {{username}}', { username })}
          </Text>
        </VStack>
      </Page.Content>
      <PageFooter />
    </Page>
  );
}
