'use client';

import { IcoDismissCircle, Page, Text } from '@magiclabs/ui-components';
import { Box, VStack } from '@styled/jsx';
import { useTranslation } from '@common/i18n';
import { useAppName } from '@hooks/common/client-config';
import { token } from '@styled/tokens';
import CloseWindowMessage from '@app/confirm/error/__components__/close-window-message';

export default function SecurityCodeExpiredState() {
  const { t } = useTranslation('confirm');
  const appName = useAppName();
  return (
    <VStack gap={2} mb={2}>
      <Page.Icon>
        <IcoDismissCircle color={token('colors.text.tertiary')} />
      </Page.Icon>
      <Box mb={1}></Box>
      <Text.H4> {t('Security code expired')}</Text.H4>
      <Text> {t(`To receive a new code, please return to ${appName} and restart the login process.`)}</Text>
      <CloseWindowMessage />
    </VStack>
  );
}
