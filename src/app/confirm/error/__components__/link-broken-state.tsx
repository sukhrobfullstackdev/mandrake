'use client';

import { IcoWarning, Page, Text } from '@magiclabs/ui-components';
import { Box, VStack } from '@styled/jsx';
import { useTranslation } from '@common/i18n';
import { useAppName } from '@hooks/common/client-config';
import { token } from '@styled/tokens';
import CloseWindowMessage from '@app/confirm/error/__components__/close-window-message';

export default function LinkBrokenState() {
  const { t } = useTranslation('confirm');

  const appName = useAppName();
  return (
    <VStack gap={2} mb={2}>
      <Page.Icon>
        <IcoWarning color={token('colors.warning.base')} />
      </Page.Icon>
      <Box mb={1}></Box>
      <Text.H4> {t('Link error')}</Text.H4>
      <Text> {t(`Please go back to ${appName} and request a new login link`)}</Text>
      <Box mb={1}></Box>
      <Text> {t('If the issue persists, try opening the link from a different email client.')}</Text>
      <CloseWindowMessage />
    </VStack>
  );
}
