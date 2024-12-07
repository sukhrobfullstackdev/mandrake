'use client';

import PageFooter from '@components/show-ui/footer';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { LoginMethodType } from '@custom-types/api-response';
import { WalletType } from '@custom-types/wallet';
import { useAppName, useAssetUri, useClientHasMfa, useColorMode } from '@hooks/common/client-config';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useFlags } from '@hooks/common/launch-darkly';
import { useSendRouter } from '@hooks/common/send-router';
import { useUserMetadata } from '@hooks/common/user-metadata';
import { useCreateFactorMutation } from '@hooks/data/embedded/account-recovery';
import { userQueryKeys, useUserInfoQuery } from '@hooks/data/embedded/user';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { useTranslation } from '@lib/common/i18n';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { DeepLinkPage, RecoveryMethodType } from '@magic-sdk/types';
import { RecoveryFactorEventEmit } from '@magic-sdk/types';
import {
  Button,
  ClientAssetLogo,
  Header,
  IcoCheckmark,
  IcoDismiss,
  IcoQuestionCircleFill,
  IconProfileDark,
  IconProfileLight,
  Page,
  Text,
} from '@magiclabs/ui-components';
import { Box, Center, Flex, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import parsePhoneNumber from 'libphonenumber-js';
import { useEffect, useState } from 'react';

export default function MagicAuthSettingsPage() {
  const router = useSendRouter();
  const email = useStore(state => state.email);
  const authUserSessionToken = useStore(state => state.authUserSessionToken);

  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const { userMetadata } = useUserMetadata();
  const authUserId = useStore(state => state.authUserId);
  const { isComplete: isHydrateSessionComplete, isError: isHydrateSessionError } = useHydrateSession();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const { t } = useTranslation('settings');

  const appName = useAppName();
  const assetUri = useAssetUri();
  const colorMode = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const flags = useFlags();
  const clientHasMfa = useClientHasMfa();

  const { mutateAsync: createFactorMutate } = useCreateFactorMutation();

  const { data: userInfoData, error: userInfoError } = useUserInfoQuery(
    userQueryKeys.info({
      authUserId: authUserId!,
      authUserSessionToken: authUserSessionToken!,
      walletType: WalletType.ETH,
    }),
    {
      enabled: !!authUserId && !!authUserSessionToken,
    },
  );

  const isMfaEnabled = userMetadata?.isMfaEnabled;

  const deeplinkPage = activeRpcPayload?.params?.[0]?.page;
  const showUI = activeRpcPayload?.params?.[0]?.showUI;

  const [hasProcessedDeepLink, setHasProcessedDeepLink] = useState(false);

  useEffect(() => {
    if (!activeRpcPayload) return;
    if (!isHydrateSessionComplete) return;
    if (!isHydrateSessionError && isHydrateSessionComplete && !deeplinkPage) {
      if (showUI !== false) {
        IFrameMessageService.showOverlay();
      }
    }
    if (isHydrateSessionError) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserDeniedAccountAccess);
    }
    if (userInfoError) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.InternalError);
    }
  }, [isHydrateSessionComplete, userInfoError]);

  const recoveryPhoneNumber = userMetadata?.recoveryFactors.find(
    factor => factor.type === RecoveryMethodType.PhoneNumber,
  );

  const onEditEmailPress = async () => {
    try {
      await createFactorMutate({ authUserId, value: email, type: 'email_address', isRecoveryEnabled: true });
      router.replace('/send/rpc/auth/magic_auth_update_email/input_address');
    } catch (e) {
      // Recency check necessary
      router.replace('/send/rpc/auth/magic_auth_update_email/recency_check');
    }
  };

  const onEditPhoneNumberPress = async () => {
    try {
      await createFactorMutate({
        authUserId,
        value: recoveryPhoneNumber?.value,
        type: 'phone_number',
        isRecoveryEnabled: true,
      });
      router.replace(`/send/rpc/user/update_phone_number/input_new_phone_number`);
    } catch (e) {
      // Recency check necessary
      router.replace(`/send/rpc/user/update_phone_number/recency_check`);
    }
  };

  const handleClose = () => {
    rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserCanceledAction, undefined, {
      closedByUser: true,
    });
  };

  useEffect(() => {
    if (!userMetadata || !deeplinkPage || hasProcessedDeepLink) return;
    if (deeplinkPage === DeepLinkPage.MFA) {
      if (!clientHasMfa) {
        return rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.FeatureNotEnabled);
      }
      if (userMetadata.isMfaEnabled) {
        router.replace('/send/rpc/auth/magic_auth_disable_mfa_flow/enter_totp');
      } else {
        router.replace('/send/rpc/auth/magic_auth_enable_mfa_flow/initial_prompt');
      }
    } else if (deeplinkPage === DeepLinkPage.UpdateEmail && email) {
      onEditEmailPress();
    } else if (flags?.isSmsRecoveryEnabled && deeplinkPage === DeepLinkPage.Recovery && email) {
      onEditPhoneNumberPress();
    } else {
      if (showUI || showUI === undefined) {
        IFrameMessageService.showOverlay();
      }
    }
    setHasProcessedDeepLink(true);
  }, [userMetadata, email, clientHasMfa]);

  useEffect(() => {
    AtomicRpcPayloadService.onEvent(RecoveryFactorEventEmit.StartEditPhoneNumber, () => {
      onEditPhoneNumberPress();
    });
    AtomicRpcPayloadService.onEvent(RecoveryFactorEventEmit.Cancel, () => {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserCanceledAction);
    });
  }, []);

  return (
    <Page backgroundType="blurred">
      <Page.Header>
        <Header.Content>
          <Text size="sm" styles={{ color: token('colors.text.tertiary') }}>
            {appName}
          </Text>
        </Header.Content>
        <Header.RightAction>
          <Button size="sm" variant="neutral" onPress={handleClose}>
            <Button.TrailingIcon>
              <IcoDismiss />
            </Button.TrailingIcon>
          </Button>
        </Header.RightAction>
      </Page.Header>
      <Page.Icon>
        <Box mt={6}>
          <ClientAssetLogo assetUri={assetUri}>
            <ClientAssetLogo.PlaceholderIcon>
              {isDarkMode ? <IconProfileDark /> : <IconProfileLight />}
            </ClientAssetLogo.PlaceholderIcon>
          </ClientAssetLogo>
        </Box>
      </Page.Icon>
      <Page.Content>
        <Text.H4>{t('Account Settings')}</Text.H4>
        <VStack w="full">
          {email && userInfoData?.login?.type === LoginMethodType.EmailLink && (
            <VStack
              w="full"
              alignItems="flex-start"
              mt={6}
              pb={4}
              borderBottom="thin solid"
              borderColor="surface.tertiary"
            >
              <Text size="sm" styles={{ fontWeight: 500 }}>
                {t('Email Address')}
              </Text>
              <Flex w="full" justify="space-between">
                <Text data-testid="email">{email}</Text>
                <Button onPress={onEditEmailPress} variant="text" label={t('Edit')} />
              </Flex>
            </VStack>
          )}
          {email && userInfoData?.login?.type === LoginMethodType.EmailLink && flags?.isSmsRecoveryEnabled && (
            <VStack
              w="full"
              alignItems="flex-start"
              pb={4}
              my={2}
              borderBottom="thin solid"
              borderColor="surface.tertiary"
            >
              <Text size="sm" styles={{ fontWeight: 500 }}>
                {t('Recovery Phone Number')}
              </Text>
              <Flex w="full" justify="space-between">
                {recoveryPhoneNumber && (
                  <Text data-testid="email">{parsePhoneNumber(recoveryPhoneNumber.value)?.formatInternational()}</Text>
                )}
                {!recoveryPhoneNumber && <Text styles={{ color: token('colors.text.tertiary') }}>{t('None')}</Text>}
                <Button
                  onPress={onEditPhoneNumberPress}
                  variant="text"
                  label={recoveryPhoneNumber ? 'Edit' : t('Add now')}
                />
              </Flex>
            </VStack>
          )}
          {clientHasMfa && (
            <VStack w="full" alignItems="flex-start">
              <Flex alignItems="center" gap={2}>
                <Text size="sm" styles={{ fontWeight: 500 }}>
                  {t('2-step verification')}
                </Text>
                <IcoQuestionCircleFill width={14} height={14} />
              </Flex>
              <Flex w="full" justify="space-between">
                <Center
                  gap={1.5}
                  rounded="sm"
                  px={2}
                  h={6}
                  bg={isMfaEnabled ? 'positive.lightest' : 'neutral.quaternary'}
                >
                  {isMfaEnabled && <IcoCheckmark width={14} height={14} />}
                  <Text styles={{ fontWeight: 600 }} size="sm">
                    {isMfaEnabled ? t('ON') : t('OFF')}
                  </Text>
                </Center>
                <Button
                  variant="text"
                  label={t(`Turn ${isMfaEnabled ? 'off' : 'on'}`)}
                  onPress={() => {
                    const route = isMfaEnabled
                      ? '/send/rpc/auth/magic_auth_disable_mfa_flow/enter_totp'
                      : '/send/rpc/auth/magic_auth_enable_mfa_flow/initial_prompt';
                    router.replace(route);
                  }}
                />
              </Flex>
            </VStack>
          )}
        </VStack>
        <PageFooter />
      </Page.Content>
    </Page>
  );
}
