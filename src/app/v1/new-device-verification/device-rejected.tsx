import { T, useTranslation } from '@common/i18n';
import { useAppName } from '@hooks/common/client-config';
import { IcoShieldRejected, Page, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { VStack } from '@styled/jsx';
import { token } from '@styled/tokens';

export const DeviceRejected = () => {
  const { t } = useTranslation('send');
  const appName = useAppName();

  return (
    <>
      <Page.Icon>
        <IcoShieldRejected color={token('colors.negative.base')} className={css({ mt: 4 })} />
      </Page.Icon>
      <Page.Content>
        <Text.H4>{t('Login request rejected')}</Text.H4>
        <VStack gap={4}>
          <Text styles={{ textAlign: 'center' }}>
            {t("We've stopped the unrecognized device from accessing your account.")}
          </Text>
          <Text styles={{ textAlign: 'center' }}>
            <T ns="send" translate="Made a mistake? Head back to <appName/> to restart the login process.">
              <span id="appName" className={css({ fontWeight: '600' })}>
                {appName}
              </span>
            </T>
          </Text>
        </VStack>
      </Page.Content>
    </>
  );
};
