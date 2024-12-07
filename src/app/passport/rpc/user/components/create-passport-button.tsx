'use client';

import { usePassportRouter } from '@hooks/common/passport-router';
import { PasskeyCreateChallengeResponse } from '@hooks/data/passport/passkey-start';
import { useTranslation } from '@lib/common/i18n';
import { base64UrlToArrayBuffer } from '@lib/utils/base64';
import { Button } from '@magiclabs/ui-components';
import { useState } from 'react';

export function createPublicKeyCredentialCreationOptions(
  passkeyCreateChallengeResponse: PasskeyCreateChallengeResponse,
): PublicKeyCredentialCreationOptions {
  return {
    challenge: base64UrlToArrayBuffer(passkeyCreateChallengeResponse.data.challenge),
    rp: {
      name: passkeyCreateChallengeResponse.data.rp.name,
      id: passkeyCreateChallengeResponse.data.rp.id,
    },
    user: {
      id: base64UrlToArrayBuffer(passkeyCreateChallengeResponse.data.user.id),
      name: passkeyCreateChallengeResponse.data.user.name,
      displayName: passkeyCreateChallengeResponse.data.user.displayName,
    },
    pubKeyCredParams: passkeyCreateChallengeResponse.data.pubKeyCredParams,
    timeout: passkeyCreateChallengeResponse.data.timeout,
    authenticatorSelection: {
      // authenticatorAttachment: 'platform', // potentially make this dynamic based on PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      residentKey: 'preferred',
      requireResidentKey: false,
      userVerification: 'preferred',
    },
  };
}

export default function CreatePassportButton() {
  const { t } = useTranslation('passport');
  const [isCreatingPassport, setIsCreatingPassport] = useState(false);
  const router = usePassportRouter();

  const handlePasskeyLogin = () => {
    setIsCreatingPassport(true);

    return router.replace('/passport/rpc/user/magic_passport_user_connect/passkey_sign_up');
  };

  return (
    <Button
      expand
      label={t('Create Passport')}
      variant="inverse"
      validating={isCreatingPassport}
      onPress={handlePasskeyLogin}
    />
  );
}
