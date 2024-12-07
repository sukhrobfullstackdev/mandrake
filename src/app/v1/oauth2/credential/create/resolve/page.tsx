'use client';

import { OAUTH_CLIENT_META_COOKIE } from '@constants/cookies';
import { DEFAULT_TOKEN_LIFESPAN } from '@constants/did-token';
import { Endpoint } from '@constants/endpoint';
import { OAuthClientMetaData } from '@custom-types/cookies';
import { useCreateDidTokenForUser } from '@hooks/common/create-did-token-for-user';
import { useHydrateOrCreateWallets } from '@hooks/common/hydrate-or-create-wallets';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useCheckSafariCookie } from '@hooks/common/oauth-safari-check';
import { useOAuthSendCredential, useOAuthSendError } from '@hooks/data/embedded/legacy-oauth';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { parseCookie } from '@lib/utils/cookies';
import { LoadingSpinner } from '@magiclabs/ui-components';
import { getCookie } from 'cookies-next';
import qs from 'qs';
import { useEffect, useRef, useState } from 'react';

const DEFAULT_ERROR = 'Failed to generate temporary magic credential.';

export default function OAuthCredentialCreateResolvePage() {
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isTimedOut, setIsTimedOut] = useState<boolean>(false);
  const startTime = useRef<number>(performance.now());
  const oaCookieRef = useRef(parseCookie<OAuthClientMetaData>(getCookie(OAUTH_CLIENT_META_COOKIE)));
  const isSafariChecked = useCheckSafariCookie();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();

  const { isComplete: isHydrateSessionComplete, isError: isHydrateSessionError } = useHydrateSession({
    enabled: isSafariChecked,
    defaultPersistEnabled: true,
  });

  const {
    walletCreationError,
    areWalletsCreated,
    ethWalletInfo,
    ethWalletCredential,
    multichainWalletCredential,
    multichainWalletInfo,
    isEthWalletHydrated,
    isMultichainWalletHydrated,
  } = useHydrateOrCreateWallets();

  const { didToken, error: didTokenError } = useCreateDidTokenForUser({
    enabled: isHydrateSessionComplete && areWalletsCreated && !!oaCookieRef.current && isSafariChecked,
    attachment: oaCookieRef.current?.encryptedAccessToken || '',
    lifespan: activeRpcPayload?.params[0]?.lifespan || DEFAULT_TOKEN_LIFESPAN,
  });

  const { data: sendCredentialData, error: sendCredentialError } = useOAuthSendCredential(
    {
      resultQuery: qs.stringify({ magic_credential: didToken }),
    },
    {
      enabled: !!didToken && isSafariChecked,
    },
  );

  const { data: sendErrorData, error: sendErrorError } = useOAuthSendError(
    {
      errorQuery: qs.stringify({ error, error_description: DEFAULT_ERROR }),
    },
    {
      enabled: !!error && isSafariChecked,
    },
  );

  const compiledError = ((): string | null => {
    if (isHydrateSessionError || walletCreationError) return DEFAULT_ERROR;
    return didTokenError || sendCredentialError?.message || null;
  })();

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setIsTimedOut(true);
    }, 30000);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // handle success redirect
  useEffect(() => {
    if (!isSafariChecked) return;

    if (sendCredentialData || (sendErrorData && sendErrorData?.platform !== 'rn')) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      logger.info('OAuth credential creation flow success', {
        timeToSuccess: startTime.current ? Math.round(performance.now() - startTime.current) : null,
        result: sendCredentialData || sendErrorData,
        hasError: !!sendErrorData,
      });

      window.location.href = sendCredentialData?.redirectURI || sendErrorData?.redirectURI || '';
    }
  }, [sendCredentialData, sendErrorError, sendErrorData?.platform, isSafariChecked]);

  // handle error redirect
  useEffect(() => {
    if (sendErrorData?.platform === 'rn' || sendErrorError) {
      const query =
        sendErrorData?.platform === 'rn' && sendErrorData?.query
          ? sendErrorData.query
          : `?${qs.stringify({
              error: 'server_error',
              error_description: error,
            })}`;

      window.location.href = `${Endpoint.Client.Error}${query}`;
    }
  }, [sendErrorData, sendErrorError]);

  // if there is an error returned somewhere, store it to a single source in state
  useEffect(() => {
    if (!isSafariChecked) return;
    if (compiledError) setError(compiledError);
  }, [compiledError]);

  useEffect(() => {
    if (isTimedOut) {
      logger.error(
        `OAuth credential creation flow timed out,
          isSafariChecked: ${isSafariChecked},
          isHydrateSessionComplete: ${isHydrateSessionComplete},
          areWalletsCreated: ${areWalletsCreated},
          isEthWalletInfoFetched: ${!!ethWalletInfo},
          isEthWalletCredentialFetched: ${!!ethWalletCredential},
          isMultichainWalletInfoFetched: ${!!multichainWalletInfo},
          isMultichainWalletInfoFetched: ${!!multichainWalletCredential},
          isEthWalletHydrated: ${isEthWalletHydrated},
          isMultichainWalletHydrated: ${isMultichainWalletHydrated},
          oaCookieRef.current: ${oaCookieRef.current},
          oaCookieRef.current JSON String: ${JSON.stringify(oaCookieRef.current)}
          didToken: ${didToken},
          didTokenError: ${didTokenError},
          `,
      );
    }
  }, [isTimedOut]);

  return (
    <div data-testid="legacy-oauth-credential-create-resolve-wrapper">
      <LoadingSpinner />
    </div>
  );
}
