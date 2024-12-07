'use client';

import { useTranslation } from '@common/i18n';
import { IcoCheckmarkCircleFill, Page, Text } from '@magiclabs/ui-components';

export default function RedirectLoginComplete() {
  const { t } = useTranslation('send');

  return (
    <>
      <Page.Icon>
        <IcoCheckmarkCircleFill />
      </Page.Icon>
      <Page.Content>
        <Text.H4>{t('Login Successful')}</Text.H4>
        <Text>{t('You can now close this tab')}</Text>
      </Page.Content>
    </>
  );
}
