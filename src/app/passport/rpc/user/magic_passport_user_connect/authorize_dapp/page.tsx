'use client';

import PassportAppLogo from '@app/passport/rpc/user/components/passport-app-logo';
import PassportPermissions from '@app/passport/rpc/user/components/passport-permissions';
import PassportPrivacyPolicy from '@app/passport/rpc/user/components/privacy-policy';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { rejectPopupRequest, resolvePopupRequest } from '@hooks/common/popup/popup-json-rpc-request';
import { usePassportAppConfig } from '@hooks/data/passport/app-config';
import { usePassportAuthorizeMutation } from '@hooks/data/passport/oauth-authorize';
import { usePassportOauthTokenMutation } from '@hooks/data/passport/oauth-token';
import { usePassportStore } from '@hooks/data/passport/store';
import { useSmartAccount } from '@hooks/passport/use-smart-account';
import { useTranslation } from '@lib/common/i18n';
import { createCryptoChallenge } from '@lib/utils/crypto';
import { IcoCheckmarkCircle, PassportPage, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, HStack, Stack } from '@styled/jsx';
import { useState } from 'react';

export interface Permissions {
  permission: string;
  isRequested: boolean;
}

export default function AuthorizeDappPage() {
  const appConfig = usePassportAppConfig();
  const appName = appConfig?.name || '';
  const { t } = useTranslation('passport');
  const { accessToken } = usePassportStore.getState();

  const network = usePassportStore(state => state.decodedQueryParams.network);

  const { smartAccount } = useSmartAccount();

  const { mutateAsync: authorizeMutation } = usePassportAuthorizeMutation();
  const { mutateAsync: mutatePassportOauthToken, isPending, isSuccess, reset } = usePassportOauthTokenMutation();

  const handleCancel = () => {
    rejectPopupRequest(RpcErrorCode.UserRejectedAction, RpcErrorMessage.UserCanceledAction);
  };
  const [errorMessage, setErrorMessage] = useState('');

  const handleError = (e: Error) => {
    reset();
    setErrorMessage(t(e.message));
  };

  const handleConnect = async () => {
    try {
      if (!appConfig || !appConfig?.id) throw new Error('App config missing');
      if (!accessToken) throw new Error('Access token missing');
      if (!network) throw new Error('Network not found');
      if (!smartAccount) throw new Error('Smart account not found');

      const { state, codeVerifier, challenge } = createCryptoChallenge();

      const oauthAuthorizeResponse = await authorizeMutation({
        responseType: 'code',
        redirectUri: window.location.origin,
        scope: 'oidc',
        state,
        codeChallenge: challenge,
      });

      const oauthTokenResponse = await mutatePassportOauthToken({
        grantType: 'authorization_code',
        redirectUri: window.location.origin,
        code: oauthAuthorizeResponse.code,
        codeVerifier,
      });

      resolvePopupRequest({ idToken: oauthTokenResponse.idToken, publicAddress: smartAccount.address });
    } catch (error) {
      logger.info('passkey authorize dapp', error);
      handleError(error as Error);
    }
  };

  return (
    <>
      <PassportPage.Content>
        <Stack gap={6} w="full" mt={2}>
          <HStack gap={4} mb={2}>
            <PassportAppLogo src={appConfig?.logoUri} height={40} width={40} />
            <Text styles={{ color: '#FFFFFFB8' }}>{window.document.location.hostname}</Text>
          </HStack>
          <Text.H3 fontWeight="normal">
            {t('Connect to')} <span className={css({ fontWeight: 'bold' })}>{appName}</span>?
          </Text.H3>
          <Text fontColor="text.secondary">
            {appName} {t('will be able to:')}
          </Text>
          <PassportPermissions />
          {errorMessage && (
            <Text variant="error" styles={{ textAlign: 'center' }}>
              {errorMessage}
            </Text>
          )}
        </Stack>
      </PassportPage.Content>
      <PassportPage.Cancel size="lg" disabled={isPending || isSuccess} onPress={handleCancel} />
      <PassportPage.Confirm
        size="lg"
        disabled={isPending || isSuccess || !smartAccount}
        label={isSuccess ? '' : 'Connect'}
        onPress={handleConnect}
        validating={isPending}
      >
        {isSuccess && (
          <PassportPage.Confirm.LeadingIcon>
            <IcoCheckmarkCircle color={'#fff'} />
          </PassportPage.Confirm.LeadingIcon>
        )}
      </PassportPage.Confirm>
      <PassportPage.Footer>
        <Box pb={3}>
          <PassportPrivacyPolicy showMagicDisclaimer={false} />
        </Box>
      </PassportPage.Footer>
    </>
  );
}
