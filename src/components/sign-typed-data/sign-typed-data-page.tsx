import PageFooter from '@components/show-ui/footer';
import WalletPageHeader from '@components/show-ui/wallet-page-header';
import { RecursivelyRenderedMessage } from '@components/sign-typed-data/recursively-rendered-message';
import { useAppName, useAssetUri, useColorMode } from '@hooks/common/client-config';
import { useStore } from '@hooks/store';
import { useTranslation } from '@lib/common/i18n';
import { getQueryClient } from '@lib/common/query-client';
import { getReferrer } from '@lib/utils/location';
import { Button, ClientAssetLogo, IcoCaretDown, Page, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, Divider, Grid, HStack, Spacer, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { EIP712TypedData } from 'eth-sig-util';
import { useEffect, useState } from 'react';

/**
 * Some third party libraries (i.e. ethers.js) automatically stringify the data, and
 * if that's the case, we need to parse it before signing to avoid throwing an error
 */
export const normalizeTypedData = (data: EIP712TypedData | string) => {
  if (!data) throw new Error('Data to sign is required');
  if (typeof data === 'string') return JSON.parse(data) as EIP712TypedData;
  return data;
};

interface SignTypedDataPageProps {
  onConfirm: () => void;
  onClose: () => void;
  isLoading: boolean;
  message: string | EIP712TypedData;
  errorMessage: string;
}

export const AppNameAndDomain = ({
  appName,
  domainOrigin,
  children,
}: {
  appName: string;
  domainOrigin: string | undefined;
  children?: React.ReactNode;
}) => {
  return (
    <HStack w="100%" alignItems="flex-start" justifyContent="space-between" p={4}>
      <VStack alignItems="flex-start" w="full">
        <Text size="sm" styles={{ color: token('colors.brand.base'), fontWeight: 500 }}>
          {appName}
        </Text>
        <Text size="sm" styles={{ color: token('colors.text.tertiary'), fontWeight: 500 }}>
          {domainOrigin || getReferrer('')}
        </Text>
      </VStack>
      {children}
    </HStack>
  );
};

export const AppNameCollapsible = ({
  appName,
  domainOrigin,
  children,
}: {
  appName: string;
  domainOrigin: string | undefined;
  children?: React.ReactNode;
}) => {
  const [isShowMsg, setIsShowMsg] = useState(false);
  const theme = useColorMode();
  const isDarkTheme = theme === 'dark';
  return (
    <VStack alignItems="stretch" w="full" borderWidth={1} borderColor="neutral.secondary" rounded="lg" gap={0}>
      <AppNameAndDomain appName={appName} domainOrigin={domainOrigin}>
        <HStack onClick={() => setIsShowMsg(prev => !prev)} cursor="pointer" justifyContent="flex-end" gap={1}>
          <Text size="sm" styles={{ color: token('colors.text.tertiary') }}>
            <span>Details</span>
          </Text>
          <IcoCaretDown
            color={token('colors.text.tertiary')}
            width={12}
            height={12}
            className={css({
              transition: 'transform 0.3s',
              transform: isShowMsg ? 'rotate(180deg)' : 'rotate(0deg)',
            })}
          />
        </HStack>
      </AppNameAndDomain>
      <VStack overflow="hidden" w="full">
        <Grid
          overflow="hidden"
          aria-expanded={isShowMsg}
          gridTemplateRows={isShowMsg ? '1fr' : '0fr'}
          transition="grid-template-rows 0.3s"
          w="full"
        >
          <Box minH={0}>
            <Divider borderColor="neutral.secondary" />

            <VStack
              maxH={240}
              overflow="auto"
              p={4}
              style={{ backgroundColor: isDarkTheme ? '#303030' : '#F8F8FA', borderRadius: '0 0 0.5rem 0.5rem' }}
              alignItems="flex-start"
              w="full"
            >
              {children}
            </VStack>
          </Box>
        </Grid>
      </VStack>
    </VStack>
  );
};

export const SignTypedDataPage = ({ onConfirm, onClose, isLoading, message, errorMessage }: SignTypedDataPageProps) => {
  const { t } = useTranslation('send');
  const { decodedQueryParams } = useStore(state => state);
  const [messageToSign, setMessageToSign] = useState<string | EIP712TypedData>(message);
  const appName = useAppName();
  const assetUri = useAssetUri();
  const queryClient = getQueryClient();
  useEffect(() => {
    if (!message) return;
    if (typeof message === 'string') setMessageToSign(JSON.parse(message));
    else setMessageToSign(message);
  }, [message]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Page backgroundType="blurred">
        <WalletPageHeader onPressClose={onClose} />
        <Page.Icon>
          <Box mt={6}>
            <ClientAssetLogo assetUri={assetUri} />
          </Box>
        </Page.Icon>
        <Page.Content>
          <VStack gap={4}>
            <Text size="lg" fontWeight="medium">
              {t('Confirm Request')}
            </Text>
            <AppNameCollapsible appName={appName} domainOrigin={decodedQueryParams?.domainOrigin}>
              <RecursivelyRenderedMessage m={messageToSign} />
            </AppNameCollapsible>
            {errorMessage && (
              <VStack>
                <Text variant="error">{errorMessage}</Text>
                <Spacer size="4" />
              </VStack>
            )}
            <HStack w="full" gap={2}>
              <Button label={t('Cancel')} variant="neutral" expand onPress={onClose} />
              <Button
                label={t('Confirm')}
                variant="primary"
                expand
                disabled={isLoading}
                validating={isLoading}
                onPress={onConfirm}
                aria-label="sign"
              />
            </HStack>
          </VStack>
        </Page.Content>
        <PageFooter />
      </Page>
    </HydrationBoundary>
  );
};
