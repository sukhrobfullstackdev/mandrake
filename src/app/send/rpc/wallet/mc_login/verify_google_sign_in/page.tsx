'use client';

import { RELAYER_LAST_LOGGED_IN_WITH_METHOD } from '@app/send/rpc/wallet/mc_login/constants';
import { ConnectWithUILoginMethod } from '@custom-types/connect-with-ui';
import { useSetAuthState } from '@hooks/common/auth-state';
import { useAssetUri } from '@hooks/common/client-config';
import { useSendRouter } from '@hooks/common/send-router';
import {
  GoogleJwtPayload,
  useGoogleSignInStartQuery,
  useGoogleSignInVerify,
} from '@hooks/data/embedded/sign-in-with-google';
import { useTranslation } from '@lib/common/i18n';
import { parseJWT } from '@lib/utils/base64';
import { createRandomString } from '@lib/utils/crypto';
import { ClientAssetLogo, LoadingSpinner, Page, Text } from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

const VerifyGoogleSignInPage = () => {
  const { t } = useTranslation('send');
  const searchParams = useSearchParams();
  const credential = decodeURIComponent(searchParams.get('credential') as string);
  const requestOriginMessage = useMemo(() => createRandomString(128), []);
  const router = useSendRouter();
  const { hydrateAndPersistAuthState } = useSetAuthState();
  const [error, setError] = useState(false);
  const { mutateAsync: mutateGoogleSignInStartAsync } = useGoogleSignInStartQuery();
  const { mutateAsync: mutateGoogleSignInVerifyAsync } = useGoogleSignInVerify();
  const assetUri = useAssetUri();

  const startAndVerifyGoogleLogin = async (googleToken: string) => {
    try {
      const { loginFlowContext } = await mutateGoogleSignInStartAsync({
        requestOriginMessage,
        token: googleToken,
      });
      const { authUserId, authUserSessionToken, refreshToken } = await mutateGoogleSignInVerifyAsync({
        requestOriginMessage,
        loginFlowContext,
      });
      const jwt = parseJWT(googleToken);
      const payload = jwt.payload as GoogleJwtPayload;

      await hydrateAndPersistAuthState({
        email: payload.email,
        authUserId,
        authUserSessionToken,
        refreshToken: refreshToken || '',
        requestOriginMessage: requestOriginMessage,
      });

      localStorage.setItem(RELAYER_LAST_LOGGED_IN_WITH_METHOD, ConnectWithUILoginMethod.LEGACY_GOOGLE_SIGN_IN);
      router.replace('/send/rpc/wallet/mc_login/wallet');
    } catch (e: unknown) {
      setError(true);
    }
  };

  useEffect(() => {
    startAndVerifyGoogleLogin(credential);
  }, []);

  return error ? (
    <Page.Content>
      <Text variant="error" styles={{ textAlign: 'center' }}>
        {t('There was an error logging in. Please refresh and try again.')}
      </Text>
    </Page.Content>
  ) : (
    <>
      <Page.Icon>
        <ClientAssetLogo assetUri={assetUri} />
      </Page.Icon>
      <Page.Content>
        <VStack gap={24}>
          <LoadingSpinner size={36} strokeWidth={4} />
        </VStack>
        <VStack>
          <Text
            styles={{
              textAlign: 'center',
              color: token('colors.text.tertiary'),
              fontSize: '0.875rem',
            }}
          >
            {t('Confirming Login')}...
          </Text>
        </VStack>
      </Page.Content>
    </>
  );
};

export default VerifyGoogleSignInPage;
