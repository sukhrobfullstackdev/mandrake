'use client';
import PageFooter from '@components/show-ui/footer';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useAppName } from '@hooks/common/client-config';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useSendRouter } from '@hooks/common/send-router';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { useTranslation } from '@lib/common/i18n';
import { Button, Header, IcoArrowLeft, IcoDismiss, IcoLockLocked, Page, Text } from '@magiclabs/ui-components';
import { useCallback } from 'react';

export default function ContactSupportPage() {
  const { t } = useTranslation('send');
  const appName = useAppName();
  const router = useSendRouter();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();

  const handlePressBack = useCallback(() => {
    return router.replace(`/send/rpc/auth/${activeRpcPayload?.method}`);
  }, []);

  const handleClose = useCallback(() => {
    rejectActiveRpcRequest(RpcErrorCode.UserRejectedAction, RpcErrorMessage.UserRejectedAction);
  }, []);

  return (
    <>
      <Page.Header>
        <Header.LeftAction>
          <Button size="sm" variant="neutral" onPress={handlePressBack} aria-label="back">
            <Button.TrailingIcon>
              <IcoArrowLeft />
            </Button.TrailingIcon>
          </Button>
        </Header.LeftAction>
        <Header.RightAction>
          <Button size="sm" variant="neutral" onPress={handleClose} aria-label="close">
            <Button.TrailingIcon>
              <IcoDismiss />
            </Button.TrailingIcon>
          </Button>
        </Header.RightAction>
      </Page.Header>
      <Page.Icon>
        <IcoLockLocked />
      </Page.Icon>
      <Page.Content>
        <Text.H4
          styles={{
            textAlign: 'center',
          }}
        >
          {t(`Contact ${appName} support`)}
        </Text.H4>
        <Text
          styles={{
            textAlign: 'center',
          }}
        >
          {t('For help recovering your account, please contact the {{appName}} support team.', { appName })}
        </Text>
      </Page.Content>
      <PageFooter />
    </>
  );
}
