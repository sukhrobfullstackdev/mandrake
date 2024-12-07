'use client';

import BrowserNotSupported from '@app/passport/rpc/user/components/browser-not-supported';
import CreatePassportButton from '@app/passport/rpc/user/components/create-passport-button';
import PassportAppLogo from '@app/passport/rpc/user/components/passport-app-logo';
import PassportEmailOtp from '@app/passport/rpc/user/components/passport-email-otp';
import PassportLoadingSpinner from '@app/passport/rpc/user/components/passport-loading-spinner';
import PassportPrivacyPolicy from '@app/passport/rpc/user/components/privacy-policy';
import { usePassportRouter } from '@hooks/common/passport-router';
import { usePassportAppConfig } from '@hooks/data/passport/app-config';
import { usePasskeyChallengeMutation } from '@hooks/data/passport/factor-challenge';
import { usePassportPasskeyLoginVerify } from '@hooks/data/passport/passkey-verify';
import { usePassportStore } from '@hooks/data/passport/store';
import { useGetEOAWalletMutation } from '@hooks/data/passport/wallet';
import { useTranslation } from '@lib/common/i18n';
import { arePasskeysSupported } from '@lib/passkeys/are-passkeys-supported';
import { base64UrlToArrayBuffer, bufferToBase64url } from '@lib/utils/base64';
import { Button, PassportPage, Text } from '@magiclabs/ui-components';
import { Box, VStack } from '@styled/jsx';
import { useEffect, useState } from 'react';

export default function PassportLoginStartPage() {
  const { t } = useTranslation('passport');

  const appConfig = usePassportAppConfig();
  const appName = appConfig?.name || '';
  const router = usePassportRouter();
  const { accessToken: passportAccessToken } = usePassportStore(state => state);
  const [isPasskeySupported, setIsPasskeySupported] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { mutateAsync: getEOAWalletMutation } = useGetEOAWalletMutation();
  const { mutateAsync: mutatePasskeyChallenge } = usePasskeyChallengeMutation();
  const { mutateAsync: mutatePasskeyLoginVerify } = usePassportPasskeyLoginVerify();

  useEffect(() => {
    const checkForExistingPasskey = async () => {
      try {
        if (passportAccessToken) {
          try {
            await getEOAWalletMutation({ accessToken: passportAccessToken });
            return router.replace('/passport/rpc/user/magic_passport_user_connect/authorize_dapp');
          } catch (error) {
            // User not logged in, error expected
          }
        }

        const existingCredentials = usePassportStore.getState().existingPasskeyCredentialIds;

        if (!existingCredentials?.length) {
          const error = new Error('No existing credential found');
          error.name = 'LocalStorageCredentialNotFound';
          throw error;
        }

        const passkeyChallengeResponse = await mutatePasskeyChallenge();

        const publicKeyCredentialRequestOptions = {
          // Server generated challenge:
          challenge: base64UrlToArrayBuffer(passkeyChallengeResponse.data.challenge || ''),
          // The same RP ID (Relying Party) as used during registration:
          rpId: passkeyChallengeResponse.data.rpId,
          timeout: passkeyChallengeResponse.data.timeout,
          // Provide a list of PublicKeyCredentialDescriptors:
          allowCredentials: existingCredentials.map(existingCredential => ({
            id: base64UrlToArrayBuffer(existingCredential),
            type: 'public-key',
          })),
          userVerification: passkeyChallengeResponse.data.userVerification as UserVerificationRequirement,
        } as PublicKeyCredentialRequestOptions;

        const requestExistingCredential = await navigator.credentials.get({
          publicKey: publicKeyCredentialRequestOptions,
        });

        if (!requestExistingCredential) {
          const error = new Error('No existing credential found');
          error.name = 'ExistingPasskeyNotFound';
          throw error;
        }

        const response = requestExistingCredential as PublicKeyCredential;
        const credentialResponse = response.response as AuthenticatorAssertionResponse;

        const serializeableAttestation = {
          authenticatorAttachment: response.authenticatorAttachment,
          id: response.id,
          rawId: bufferToBase64url(response.rawId),
          response: {
            signature: bufferToBase64url(credentialResponse.signature),
            authenticatorData: bufferToBase64url(credentialResponse.authenticatorData),
            clientDataJSON: bufferToBase64url(credentialResponse.clientDataJSON),
          },
          type: response.type,
        };

        const passkeyLoginVerifyResponse = await mutatePasskeyLoginVerify({
          verifyFlowId: passkeyChallengeResponse.verifyFlowId,
          attestation: JSON.stringify(serializeableAttestation),
        });
        const { accessToken, refreshToken } = passkeyLoginVerifyResponse;

        // Store the access token and refresh token in local storage
        usePassportStore.setState({ accessToken, refreshToken });
        router.replace('/passport/rpc/user/magic_passport_user_connect/get_eoa_wallet');
      } catch (error) {
        const errorName = (error as Error).name;
        logger.info('magic_passport_user_connect error', error);
        if (errorName === 'LocalStorageCredentialNotFound') {
          // swallow the error here, the user does not have an existing credential in localStorage
        } else if (errorName === 'ExistingPasskeyNotFound') {
          // swallow the error here, the user does not have an existing credential in their Credential Store
        } else if (errorName === 'NotAllowedError') {
          // swallow the error here if the user denies the passkey request
        } else {
          logger.error(error);
        }
        setIsLoading(false);
      }
    };
    arePasskeysSupported().then(isSupported => {
      setIsPasskeySupported(isSupported);
      if (isSupported) {
        router.prefetch('/passport/rpc/user/magic_passport_user_connect/passkey_sign_in');
        router.prefetch('/passport/rpc/user/magic_passport_user_connect/passkey_sign_up');

        checkForExistingPasskey();
      } else {
        setIsLoading(false);
      }
    });
  }, []);

  const handleLoginOnPress = () => {
    router.replace('/passport/rpc/user/magic_passport_user_connect/passkey_sign_in');
  };

  return (
    <>
      <PassportPage.Content>
        {isLoading ? (
          <PassportLoadingSpinner text={t('Authenticating')} />
        ) : (
          <>
            <VStack>
              <PassportAppLogo src={appConfig?.logoUri} height={56} width={56} />
              <Text.H4 styles={{ textAlign: 'center' }}>{appName}</Text.H4>
            </VStack>
            <VStack mt="2rem" w="full">
              {isPasskeySupported ? (
                <>
                  <CreatePassportButton />
                  <PassportEmailOtp />
                  <Button expand label={t('Login')} variant="neutral" onPress={handleLoginOnPress} />
                </>
              ) : (
                <BrowserNotSupported />
              )}
              {/*<Button expand label={t('Use existing wallet')} variant="tertiary">
              <Button.LeadingIcon>
                <WltMetamask />
              </Button.LeadingIcon>
            </Button>*/}
            </VStack>
          </>
        )}
      </PassportPage.Content>
      {!isLoading && (
        <PassportPage.Footer>
          <Box pb={3}>
            <PassportPrivacyPolicy />
          </Box>
        </PassportPage.Footer>
      )}
    </>
  );
}
