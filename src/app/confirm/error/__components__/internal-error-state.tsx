'use client';

import { IcoAlertCircle, Page, Text } from '@magiclabs/ui-components';
import { Box, VStack } from '@styled/jsx';
import { useTranslation } from '@common/i18n';
import { token } from '@styled/tokens';
import CloseWindowMessage from '@app/confirm/error/__components__/close-window-message';

export default function InternalErrorState() {
  const { t } = useTranslation('confirm');

  return (
    <VStack gap={2} mb={2}>
      <Page.Icon>
        <IcoAlertCircle color={token('colors.negative.base')} />
      </Page.Icon>
      <Box mb={1}></Box>
      <Text.H4> {t('Technical error')}</Text.H4>
      <Text> {t(`Hang tight, we’re working on a fix. Please try again soon.`)}</Text>
      <CloseWindowMessage />
    </VStack>
  );
}
