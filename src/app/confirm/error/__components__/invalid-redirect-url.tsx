'use client';

import { IcoAlertCircle, Page, Text } from '@magiclabs/ui-components';
import { Box, VStack } from '@styled/jsx';
import { useTranslation } from '@common/i18n';
import { token } from '@styled/tokens';
import CloseWindowMessage from '@app/confirm/error/__components__/close-window-message';

export default function InvalidRedirectUrl() {
  const { t } = useTranslation('confirm');

  return (
    <VStack>
      <Page.Icon>
        <IcoAlertCircle color={token('colors.negative.base')} />
      </Page.Icon>
      <Box mb={1}></Box>
      <Text.H4> {t('Invalid Redirect URL')}</Text.H4>
      <Text> {t(`The given redirect URL is not in the allowlist`)}</Text>
      <CloseWindowMessage />
    </VStack>
  );
}
