'use client';

import { useUpdateEmailContext } from '@app/send/rpc/auth/magic_auth_update_email/update-email-context';
import { useTranslation } from '@common/i18n';
import PageFooter from '@components/show-ui/footer';
import { useAppName } from '@hooks/common/client-config';
import { useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useSendRouter } from '@hooks/common/send-router';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { MagicPayloadMethod } from '@magic-sdk/types';
import { Button, IcoCheckmarkCircle, Page, Text } from '@magiclabs/ui-components';
import { Box } from '@styled/jsx';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function UpdatedEmailDone() {
  const { t } = useTranslation('send');
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const method = activeRpcPayload?.method;
  const showUI = activeRpcPayload?.params?.[0]?.showUI;
  const router = useSendRouter();
  const pathname = usePathname();
  const resolveActiveRequest = useResolveActiveRpcRequest();
  const { newEmail } = useUpdateEmailContext();
  const appName = useAppName();
  const deeplinkPage = activeRpcPayload?.params?.[0]?.page;
  useEffect(() => {
    AtomicRpcPayloadService.logPagePerformanceMetrics(pathname);

    if (showUI === false) {
      resolveActiveRequest(true);
    }
  }, []);
  const onClose = () => {
    if (method === MagicPayloadMethod.UserSettings && !deeplinkPage) {
      router.replace('/send/rpc/user/magic_auth_settings');
    } else {
      resolveActiveRequest(true);
    }
  };
  return (
    <Page backgroundType="blurred">
      <Page.Icon>
        <IcoCheckmarkCircle />
      </Page.Icon>
      <Page.Content>
        <Text.H4>{t('Email address updated')}</Text.H4>
        <Box my={3}>
          <Text size="lg" styles={{ textAlign: 'center' }}>
            {t('{{email}} can now be used to access your {{appName}} account', {
              appName,
              email: newEmail,
            })}
          </Text>
        </Box>
        <Button type="button" expand label={t('Close')} onPress={onClose} />
      </Page.Content>
      <PageFooter />
    </Page>
  );
}
