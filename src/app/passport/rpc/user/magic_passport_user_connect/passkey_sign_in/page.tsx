'use client';

import PassportLoadingSpinner from '@app/passport/rpc/user/components/passport-loading-spinner';
import { usePassportRouter } from '@hooks/common/passport-router';
import { usePasskeyChallengeMutation } from '@hooks/data/passport/factor-challenge';
import { usePassportPasskeyLoginVerify } from '@hooks/data/passport/passkey-verify';
import { usePassportStore } from '@hooks/data/passport/store';
import { useTranslation } from '@lib/common/i18n';
import { base64UrlToArrayBuffer, bufferToBase64url } from '@lib/utils/base64';
import { PassportPage } from '@magiclabs/ui-components';
import { useEffect } from 'react';

export default function PasskeySignInPage() {
  const router = usePassportRouter();
  const { mutateAsync: mutatePasskeyChallenge } = usePasskeyChallengeMutation();
  const { mutateAsync: mutatePasskeyLoginVerify } = usePassportPasskeyLoginVerify();
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
    router.prefetch('/passport/rpc/user/magic_passport_user_connect/get_eoa_wallet');

    const handlePasskeySignIn = async () => {
      try {
        const existingCredentials = usePassportStore.getState().existingPasskeyCredentialIds;
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
          mediation: 'silent',
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

        const updatedPasskeyCredentialIds = existingCredentials.includes(response.id)
          ? existingCredentials
          : [...existingCredentials, response.id];

        usePassportStore.setState({
          accessToken,
          refreshToken,
          existingPasskeyCredentialIds: updatedPasskeyCredentialIds,
        });
        router.replace('/passport/rpc/user/magic_passport_user_connect/get_eoa_wallet');
      } catch (error) {
        const errorName = (error as Error).name;
        logger.info('passkey sign in error', error);
        if (errorName === 'ExistingPasskeyNotFound') {
          // probably route to passkey sign up if the user doesn't have an existing passkey?
          return router.replace('/passport/rpc/user/magic_passport_user_connect/passkey_sign_up');
        } else {
          return router.replace('/passport/rpc/user/magic_passport_user_connect');
        }
      }
    };

    handlePasskeySignIn();
  }, []);

  return (
    <PassportPage.Content>
      <PassportLoadingSpinner text={t(`Authenticating`)} />
    </PassportPage.Content>
  );
}
