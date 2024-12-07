/* istanbul ignore file */
'use client';

import { ErrorBoundary } from '@components/error-boundary';
import PageFooter from '@components/show-ui/footer';
import { APP_URL, DEPLOY_ENV, NODE_ENV } from '@constants/env';
import { useFlags } from '@hooks/common/launch-darkly';
import { useSetLanguage, useTranslation } from '@lib/common/i18n';
import { Button, IcoCode, Page, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, VStack } from '@styled/jsx';

export default function Home() {
  const { t } = useTranslation('common');
  const setLanguage = useSetLanguage();
  const flags = useFlags();

  return (
    <main>
      <ErrorBoundary fallback={<p>Error!!!</p>}>
        <Page>
          <Page.Icon>
            <IcoCode />
          </Page.Icon>
          <Page.Content>
            <Text.H3>{'Welcome to Mandrake!'}</Text.H3>
            <VStack
              className={css({
                background: 'neutral.tertiary',
                borderRadius: '3xl',
                p: 8,
                alignItems: 'start',
              })}
            >
              <Text.Mono>
                <b>APP:</b> {APP_URL || 'N/A'}
              </Text.Mono>
              <Text.Mono>
                <b>DEPLOY:</b> {DEPLOY_ENV}
              </Text.Mono>
              <Text.Mono>
                <b>NODE:</b> {NODE_ENV}
              </Text.Mono>
            </VStack>
            <Box py={4}>
              <Text.Mono size="sm" styles={{ textAlign: 'center' }}>
                Launch Darkly `test` flag: <b>{flags?.test ? 'on' : 'off'}</b>
              </Text.Mono>
            </Box>
            <Text variant="info" styles={{ fontWeight: 600 }}>
              {t('This is a test of {{appName}}.', { appName: 'FooBar' }, { fallback: 'Translation unavailable.' })}
            </Text>
            <Button onPress={() => setLanguage('es')} label="Change to Spanish" />
            <Button onPress={() => setLanguage('fr')} label="Change to French" />
            <Button onPress={() => setLanguage('en-US')} label="Change to English" />
          </Page.Content>
          <PageFooter />
        </Page>
      </ErrorBoundary>
    </main>
  );
}
