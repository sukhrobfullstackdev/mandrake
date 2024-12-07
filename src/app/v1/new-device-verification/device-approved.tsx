import { T, useTranslation } from '@common/i18n';
import { useAppName } from '@hooks/common/client-config';
import { IcoShieldApproved, Page, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { VStack } from '@styled/jsx';
import { token } from '@styled/tokens';

export const DeviceApproved = () => {
  const { t } = useTranslation('send');
  const appName = useAppName();

  return (
    <>
      <Page.Icon>
        <IcoShieldApproved color={token('colors.positive.base')} className={css({ mt: 4 })} />
      </Page.Icon>
      <Page.Content>
        <Text.H4>{t('Login Approved')}</Text.H4>
        <VStack gap={4}>
          <Text styles={{ textAlign: 'center' }}>
            <T ns="send" translate="Go back to <appName/> to finish logging in.">
              <span id="appName" className={css({ fontWeight: '600' })}>
                {appName}
              </span>
            </T>
          </Text>
          <Text>{t('You can now close this tab.')}</Text>
        </VStack>
      </Page.Content>
    </>
  );
};
