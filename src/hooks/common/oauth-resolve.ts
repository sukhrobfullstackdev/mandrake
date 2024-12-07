import { DEFAULT_TOKEN_LIFESPAN } from '@constants/did-token';
import { OpenIDConnectUserInfo } from '@custom-types/open-id-connect';
import { MagicUserMetadata } from '@custom-types/user';
import { useCreateDidTokenForUser } from '@hooks/common/create-did-token-for-user';
import { useHydrateOrCreateWallets } from '@hooks/common/hydrate-or-create-wallets';
import { useUserMetadata } from '@hooks/common/user-metadata';
import { OAuthVerifyResponse } from '@hooks/data/embedded/oauth';
import { useUserLogoutQuery } from '@hooks/data/embedded/user';
import { useStore } from '@hooks/store';
import { oauthScopeToArray } from '@lib/utils/oauth';
import { useEffect, useState } from 'react';
import { useSetAuthState } from './auth-state';

export interface OAuthResultData {
  oauth: {
    provider: string;
    scope: string[];
    accessToken: string;
    userHandle: string;
    userInfo: OpenIDConnectUserInfo<'camelCase'>;
  };
  magic: {
    idToken: string | null;
    userMetadata: MagicUserMetadata;
  };
}

interface UseOAuthResolveParams {
  provider?: string;
  scope?: string;
  lifespan?: number;
}

interface UseOAuthReturn {
  data: OAuthResultData | null;
  error: string | null;
  resolve: (data: OAuthVerifyResponse) => void;
}

export const useOAuthResolve = ({ provider, scope, lifespan }: UseOAuthResolveParams): UseOAuthReturn => {
  const [authorizationToken, setAuthorizationToken] = useState<string | null>(null);
  const [result, setResult] = useState<OAuthResultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verifyData, setVerifyData] = useState<OAuthVerifyResponse | null>(null);
  const { setAndPersistEmail } = useSetAuthState();
  const enabled = !!provider && !!verifyData;

  const { mutate: mutateUserLogout } = useUserLogoutQuery();

  const { areWalletsCreated, walletCreationError } = useHydrateOrCreateWallets();
  const { userMetadata } = useUserMetadata();
  const { didToken, error: didTokenError } = useCreateDidTokenForUser({
    enabled: enabled && areWalletsCreated,
    lifespan: lifespan || DEFAULT_TOKEN_LIFESPAN,
  });

  const resolve = (data: OAuthVerifyResponse): void => {
    setVerifyData(data);
  };

  // wait for DID token and then set id token
  useEffect(() => {
    if (authorizationToken || !didToken || !verifyData) return;
    setAuthorizationToken(provider === 'apple' ? didToken : verifyData?.oauthAccessToken || null);
  }, [didToken, verifyData?.authUserId, authorizationToken, provider]);

  useEffect(() => {
    if (!verifyData || !userMetadata || !authorizationToken) return;

    let email = null;

    if (verifyData?.userInfo) {
      // assume true if email verified is null
      const isEmailVerified = verifyData?.userInfo?.emailVerified ?? true;
      email = isEmailVerified && verifyData?.userInfo?.email ? verifyData.userInfo.email : null;

      if (email) {
        setAndPersistEmail({ email: verifyData?.userInfo.email || '' });
      }
    }

    if (userMetadata?.publicAddress && verifyData && authorizationToken) {
      logger.info('OAuth resolve scope', scope);
      logger.info('OAuth resolve scope typeof', typeof scope);
      const output: OAuthResultData = {
        oauth: {
          provider: provider || '',
          scope: oauthScopeToArray(scope as string) || '',
          accessToken: verifyData?.oauthAccessToken,
          userHandle: verifyData?.authUserId,
          userInfo: verifyData.userInfo,
        },
        magic: {
          idToken: didToken,
          userMetadata: {
            ...userMetadata,
            email: userMetadata.email || email || '',
          },
        },
      };

      setResult(output);
    }
  }, [userMetadata?.publicAddress, verifyData?.authUserId, authorizationToken]);

  // handle blocking errors
  useEffect(() => {
    if (walletCreationError || didTokenError) {
      mutateUserLogout(
        { authUserId: useStore.getState().authUserId || '' },
        {
          onSettled: () => {
            setError('Failed to retrieve OAuth access token.');
          },
        },
      );
    }
  }, [walletCreationError, didTokenError]);

  return {
    data: result,
    error,
    resolve,
  };
};
