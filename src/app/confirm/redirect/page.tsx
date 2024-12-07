'use client';

import { useEmailLinkConfirmContext } from '@app/confirm/email-link-confirm-context';
import { useTranslation } from '@common/i18n';
import { EmailLinkConfirmErrorState } from '@constants/email-link';
import { useCreateDidTokenForUser } from '@hooks/common/create-did-token-for-user';
import { useEmailLinkLoginVerifyQuery, useEmailLinkRedirectConfirmQuery } from '@hooks/data/embedded/email-link';
import { useStore } from '@hooks/store';
import { decodeJWT } from '@lib/email-link/decode-jwt';
import { IcoEmailOpen, LoadingSpinner, Page, Text } from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { decodeBase64URL } from '@utils/base64';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
export default function EmailLinkConfirmRedirect() {
  const router = useRouter();
  const { t } = useTranslation('confirm');

  const { tlt, e: env, redirectUrl, flowContext, isQueryHydrated } = useEmailLinkConfirmContext();
  const [isHydrateSessionComplete, setHydrationSessionComplete] = useState(false);

  /**
   * We sign the `temporary_auth_token` encoded into the `tempLoginToken` JWT
   * payload. This field is persisted in the API, so we can use it to uniquely
   * associate the `magic_credential` to the current login request.
   */
  const { mutate: mutateRedirectConfirm } = useEmailLinkRedirectConfirmQuery();

  /**
   * Verify Login Auth token
   */
  const { mutate: mutateEmailLinkLoginVerify } = useEmailLinkLoginVerifyQuery();

  const tempAuthToken = tlt
    ? decodeJWT<{ temporary_auth_token: string }>(tlt!, decodeBase64URL).payload.temporary_auth_token
    : '';

  /**
   * Step 3 - Hydrate user session from the redirect confirm
   */
  useEffect(() => {
    if (!isQueryHydrated) return;
    mutateRedirectConfirm(
      {
        tlt: tlt!,
        env: env || 'testnet',
        loginFlowContext: flowContext,
      },
      {
        onSuccess: response => {
          useStore.setState({
            authUserId: response.authUserId,
            authUserSessionToken: response.ephemeralAuthUserSessionToken,
            email: response.email,
          });
          setHydrationSessionComplete(true);
        },
        onError: () => {
          router.push(`/confirm/error?errorType=${EmailLinkConfirmErrorState.RedirectFailed}`);
        },
      },
    );
  }, [isQueryHydrated]);

  /**
   *  Step 4 - Create DID token for user
   */
  const { didToken, error: didTokenError } = useCreateDidTokenForUser({
    enabled: isHydrateSessionComplete && isQueryHydrated,
    attachment: tempAuthToken,
    lifespan: 15 * 60, // 15 minutes
  });

  /**
   * Step 5 - Hydrate user session from the redirect confirm
   */
  useEffect(() => {
    if (didTokenError) {
      router.push(`/confirm/error?errorType=${EmailLinkConfirmErrorState.InternalError}`);
      return;
    }
    if (didToken) {
      mutateEmailLinkLoginVerify(
        { tlt: tlt!, env: env || 'testnet' },
        {
          onSuccess: () => {
            if (redirectUrl) {
              const url = new URL(redirectUrl);
              url.searchParams.set('magic_credential', didToken);
              router.push(url.href);
            } else {
              logger.error('Email Link: redirectUrl is missing');
            }
          },
          onError: () => {},
        },
      );
    }
  }, [didToken]);

  return (
    <>
      <Page.Icon>
        <IcoEmailOpen />
      </Page.Icon>
      <Page.Content>
        <LoadingSpinner size={36} strokeWidth={4} />
        <VStack>
          <Text
            styles={{
              textAlign: 'center',
              color: token('colors.ink.70'),
              fontSize: '0.875rem',
            }}
          >
            {t('Redirecting')}...
          </Text>
        </VStack>
      </Page.Content>
    </>
  );
}
