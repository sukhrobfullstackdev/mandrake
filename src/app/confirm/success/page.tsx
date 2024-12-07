'use client';

import { IcoCheckmarkCircle, Page, Text } from '@magiclabs/ui-components';
import { token } from '@styled/tokens';
import { VStack } from '@styled/jsx';
import CloseWindowMessage from '@app/confirm/error/__components__/close-window-message';
import { useTranslation } from '@common/i18n';
import { useAppName } from '@hooks/common/client-config';

export default function EmailLinkConfirmSuccess() {
  const { t } = useTranslation('confirm');
  const appName = useAppName();

  return (
    <Page.Content>
      <Page.Icon>
        <IcoCheckmarkCircle color={token('colors.brand.base')} />
      </Page.Icon>
      <VStack>
        <Text.H4> {t(`Login Complete!`)}</Text.H4>
        <Text>{t(`Go back to ${appName}.`)}</Text>
        <CloseWindowMessage />
      </VStack>
    </Page.Content>
  );
}
