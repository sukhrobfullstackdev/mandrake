'use client';

import { IcoWarning, Page, Text } from '@magiclabs/ui-components';
import { Box, VStack } from '@styled/jsx';
import { useTranslation } from '@common/i18n';
import { useAppName } from '@hooks/common/client-config';
import { token } from '@styled/tokens';

export default function IpAddressMismatchState() {
  const { t } = useTranslation('confirm');

  const appName = useAppName();
  return (
    <VStack gap={2} mb={2}>
      <Page.Icon>
        <IcoWarning color={token('colors.warning.base')} />
      </Page.Icon>
      <Box mb={1}></Box>
      <Text.H4> {t('IP address mismatch')}</Text.H4>
      <Text>
        {t(
          `For your security, please request a new login link from ${appName} and click the link using the same device.`,
        )}
      </Text>
      <Box mb={1}></Box>
      <Text>{t(`If you did not request this link, you can safely ignore this message.`)}</Text>
    </VStack>
  );
}
