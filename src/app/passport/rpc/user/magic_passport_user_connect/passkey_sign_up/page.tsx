/* istanbul ignore file */
'use client';

import { createPasskeyUsername } from '@app/passport/libs/passkey/create-passkey-username';
import { createPublicKeyCredentialCreationOptions } from '@app/passport/rpc/user/components/create-passport-button';
import PassportLoadingSpinner from '@app/passport/rpc/user/components/passport-loading-spinner';
import { PassportPageErrorCodes } from '@constants/passport-page-errors';
import { PASSPORT_ERROR_URL } from '@constants/routes';
import { usePassportRouter } from '@hooks/common/passport-router';
import { usePasskeyCreateChallenge, UserAuthFactorType } from '@hooks/data/passport/passkey-start';
import { usePassportPasskeyLoginVerify } from '@hooks/data/passport/passkey-verify';
import { usePassportStore } from '@hooks/data/passport/store';
import { useTranslation } from '@lib/common/i18n';
import { bufferToBase64url } from '@lib/utils/base64';
import { PassportPage } from '@magiclabs/ui-components';
import { useEffect } from 'react';

export default function PasskeySignUpPage() {
  const { mutateAsync: mutatePasskeyCreateChallenge } = usePasskeyCreateChallenge();
  const { mutateAsync: mutatePasskeyLoginVerify } = usePassportPasskeyLoginVerify();
  const router = usePassportRouter();
  const { t } = useTranslation('passport');
  const { magicApiKey } = usePassportStore.getState();

  // The 1password extension doesn't work in popups without the desktop app.
  // so we will remove 1password support by removing the notification from the dom
  useEffect(() => {
    // bypass 1password magicApiKey https://magiclink.atlassian.net/browse/M2PB-246
    if (magicApiKey === 'pk_93D4DA0867738CB1') return;
    const observer = new MutationObserver(() => document.querySelector('com-1password-notification')?.remove());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    router.prefetch('/passport/rpc/user/magic_passport_user_connect/create_eoa_wallet');

    const handlePasskeySignUp = async () => {
      try {
        const passkeyUsername = createPasskeyUsername();

        const passkeyCreateChallengeResponse = await mutatePasskeyCreateChallenge({
          type: UserAuthFactorType.Passkey,
          username: passkeyUsername,
        });

        const publicKeyCredentialCreationOptions =
          createPublicKeyCredentialCreationOptions(passkeyCreateChallengeResponse);

        const credential = await navigator.credentials.create({
          publicKey: publicKeyCredentialCreationOptions,
        });

        if (!credential) {
          const error = new Error('Error creating passkey');
          error.name = 'PasskeyCreateError';
          throw error;
        }

        const response = credential as PublicKeyCredential;
        const credentialResponse = response.response as AuthenticatorAttestationResponse;

        const serializeableAttestation = {
          authenticatorAttachment: response.authenticatorAttachment,
          id: response.id,
          rawId: bufferToBase64url(response.rawId),
          response: {
            attestationObject: bufferToBase64url(credentialResponse.attestationObject),
            clientDataJSON: bufferToBase64url(credentialResponse.clientDataJSON),
          },
          type: response.type,
        };

        const passkeyLoginVerifyResponse = await mutatePasskeyLoginVerify({
          verifyFlowId: passkeyCreateChallengeResponse.verifyFlowId,
          attestation: JSON.stringify(serializeableAttestation),
        });

        const { accessToken, refreshToken } = passkeyLoginVerifyResponse;

        const existingCredentials = usePassportStore.getState().existingPasskeyCredentialIds;

        const updatedPasskeyCredentialIds = existingCredentials.includes(response.id)
          ? existingCredentials
          : [...existingCredentials, response.id];

        usePassportStore.setState({
          accessToken,
          existingPasskeyCredentialIds: updatedPasskeyCredentialIds,
          refreshToken,
        });
        router.replace('/passport/rpc/user/magic_passport_user_connect/create_eoa_wallet');
      } catch (error) {
        const errorName = (error as Error).name;
        logger.info('passkey sign up error', errorName);
        if (errorName === 'PasskeyCreateError') {
          // swallow the error here, we were unable to create the passkey
          return router.replace(PASSPORT_ERROR_URL(PassportPageErrorCodes.ACCOUNT_CREATION_FAILED));
        } else if (errorName === 'NotAllowedError') {
          return router.replace('/passport/rpc/user/magic_passport_user_connect');
        }
        logger.error(error);
      }
    };
    handlePasskeySignUp();
  }, []);

  return (
    <PassportPage.Content>
      <PassportLoadingSpinner text={t(`Authenticating`)} />
    </PassportPage.Content>
  );
}
