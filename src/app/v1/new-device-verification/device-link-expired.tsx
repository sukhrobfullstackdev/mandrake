import { useTranslation } from '@common/i18n';
import { IcoExpiration, Page, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';

export const DeviceLinkExpired = () => {
  const { t } = useTranslation('send');

  return (
    <>
      <Page.Icon>
        <IcoExpiration className={css({ mt: 4 })} />
      </Page.Icon>
      <Page.Content>
        <Text.H4>{t('Link expired')}</Text.H4>
        <Text styles={{ textAlign: 'center' }}>
          {t('Your login approval link has expired. Request a new one to continue.')}
        </Text>
      </Page.Content>
    </>
  );
};
