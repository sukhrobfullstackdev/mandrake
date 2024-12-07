'use client';
import { useUpdatePhoneNumberContext } from '@app/send/rpc/user/update_phone_number/update-phone-number-context';
import { useTranslation } from '@common/i18n';
import PageFooter from '@components/show-ui/footer';
import { useAppName } from '@hooks/common/client-config';
import { useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useSendRouter } from '@hooks/common/send-router';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { Button, IcoCheckmarkCircle, Page, Text } from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';
import { useEffect } from 'react';

export default function UpdatedPhoneNumberDone() {
  const { t } = useTranslation('send');
  const router = useSendRouter();
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();
  const { newPhoneNumber } = useUpdatePhoneNumberContext();
  const appName = useAppName();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const deeplinkPage = activeRpcPayload?.params?.[0]?.page;
  const showUI = activeRpcPayload?.params?.[0]?.showUI;
  useEffect(() => {
    if (showUI === false && deeplinkPage === 'recovery') resolveActiveRpcRequest(true);
    if (activeRpcPayload && !(showUI === false && deeplinkPage === 'recovery')) {
      activeRpcPayload.params = [];
      /**
       * In src/app/send/rpc/user/update_phone_number/layout.tsx, we were making params empty as it might redirect to any flow when coming back to showSettings.
       * However, we cannot make params in layout as we need params to know whether to redirect to showSettings or to reject the active rpc payload in the flow.
       * But, we need to make params empty when the process is finished. Otherwise, it may redirect to the corresponding page in the settings page as params have value. I
       */
    }
  }, []);
  const onClose = () => {
    if (deeplinkPage) {
      resolveActiveRpcRequest(true);
    } else {
      router.replace(`/send/rpc/user/magic_auth_settings`);
    }
  };
  return (
    <Page backgroundType="blurred">
      <Page.Icon>
        <IcoCheckmarkCircle />
      </Page.Icon>
      <Page.Content>
        <VStack my={3}>
          <Text.H4>{t('Phone number updated')}</Text.H4>
          <Text size="lg" styles={{ textAlign: 'center' }}>
            {t('{{phoneNumber}} can now be used to access your {{appName}} account', {
              phoneNumber: newPhoneNumber!,
              appName,
            })}
          </Text>
        </VStack>
        <Button type="button" expand label={t('Close')} onPress={onClose} />
      </Page.Content>
      <PageFooter />
    </Page>
  );
}
