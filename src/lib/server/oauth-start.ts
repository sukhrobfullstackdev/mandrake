import { RpcErrorCode } from '@constants/json-rpc';
import { OAuthApp } from '@custom-types/magic-client';
import { magicClientQueryKeys, makeClientConfigFetcher, makeOAuthAppFetcher } from '@hooks/data/embedded/magic-client';
import { LDFlagSet } from '@launchdarkly/node-server-sdk';
import { ServerRpcError } from '@lib/common/custom-errors';
import { getServerQueryClient } from '@lib/server/query-client';
import { RedirectAllowlistError, checkRedirectAllowlist } from '@lib/utils/oauth';

interface UseOAuthStartServerParams {
  provider: string;
  redirectURI?: string;
  magicApiKey?: string | null;
  flags?: LDFlagSet;
  doRedirectUrlCheck?: boolean;
  oauthApp?: OAuthApp;
}

export const oauthStart = async ({
  provider,
  redirectURI = '',
  magicApiKey = '',
  flags,
  doRedirectUrlCheck = true,
  oauthApp,
}: UseOAuthStartServerParams): Promise<void> => {
  const queryClient = await getServerQueryClient();

  const { rpcRouteMagicOauthLoginWithRedirectStartEnabled, oauthV2Providers, enforceRedirectAllowlistEnabled } =
    flags || {};

  if (!rpcRouteMagicOauthLoginWithRedirectStartEnabled || !oauthV2Providers.providers?.includes(provider)) {
    logger.warn('Feature is not enabled', {
      oauthStep: 'start',
      provider: provider || 'no provider given',
      redirectURI: redirectURI || 'no redirect url given',
    });

    throw new ServerRpcError(RpcErrorCode.MethodNotFound);
  }

  if (doRedirectUrlCheck && !redirectURI) {
    logger.error('Redirect URI required', {
      oauthStep: 'start',
      provider: provider || 'no provider given',
      redirectURI: redirectURI || 'no redirect url given',
    });

    throw new ServerRpcError(RpcErrorCode.InvalidParams);
  }

  // get cleint config and validate redirect url with allowlist
  if (doRedirectUrlCheck) {
    logger.info(`oauth-start.ts magicApiKey ${magicApiKey}`);
    const clientConfig = await queryClient.fetchQuery({
      queryKey: magicClientQueryKeys.config({ magicApiKey: magicApiKey || '' }),
      queryFn: makeClientConfigFetcher(),
      staleTime: 1000 * 60 * 8, // 8 minutes
      gcTime: 1000 * 60 * 15, // 15 minutes
    });

    if (!clientConfig) {
      logger.error('Client config not found', {
        oauthStep: 'start',
        provider: provider || 'no provider given',
        redirectURI: redirectURI || 'no redirect url given',
      });
    }

    const { redirectUrl: allowListRedirectUrl } = clientConfig.accessAllowlists || {};

    const { redirectUrlIsValid, redirectUrlError } = checkRedirectAllowlist({
      redirectUrl: redirectURI,
      redirectAllowList: allowListRedirectUrl,
      isRequired: clientConfig.legacyRedirect === false && enforceRedirectAllowlistEnabled,
    });

    // redirect url must be in allow list
    if (!redirectUrlIsValid) {
      switch (redirectUrlError) {
        case RedirectAllowlistError.EMPTY:
          logger.error('OAuth Error Redirect Allowlist Required', {
            detail: allowListRedirectUrl,
            oauthStep: 'start',
            provider: provider || 'no provider given',
            redirectURI: redirectURI || 'no redirect url given',
          });

          throw new ServerRpcError(RpcErrorCode.InvalidParams);

        case RedirectAllowlistError.MISMATCH:
        default:
          logger.error('OAuth Error InvalidRedirectUrl', {
            detail: allowListRedirectUrl,
            oauthStep: 'start',
            provider: provider || 'no provider given',
            redirectURI: redirectURI || 'no redirect url given',
          });

          throw new ServerRpcError(RpcErrorCode.InvalidParams);
      }
    }
  }

  /** Set for prefetch the oauth app data. If we already have it, we'll save
   * ourselves a network request.
   */
  if (oauthApp?.id) {
    queryClient.setQueryData(magicClientQueryKeys.oauthApp({ provider }), [oauthApp]);
  } else {
    await queryClient.prefetchQuery({
      queryKey: magicClientQueryKeys.oauthApp({ provider }),
      queryFn: makeOAuthAppFetcher(),
      staleTime: 1000 * 60 * 8, // 8 minutes
      gcTime: 1000 * 60 * 15, // 15 minutes
    });
  }
};
