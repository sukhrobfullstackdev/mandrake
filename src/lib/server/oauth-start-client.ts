import { ClientConfig, OAuthApp } from '@custom-types/magic-client';
import { NodeError } from '@hooks/common/ethereum-proxy';
import { magicClientQueryKeys, makeOAuthAppFetcher } from '@hooks/data/embedded/magic-client';
import { LDFlagSet } from '@launchdarkly/node-server-sdk';
import { getQueryClient } from '@lib/common/query-client';
import { assertURLWithDomainAllowlist } from '@lib/utils/assert-url';

interface UseOAuthStartParams {
  provider: string;
  redirectURI?: string;
  flags?: LDFlagSet;
  doRedirectUrlCheck?: boolean;
  oauthApp?: OAuthApp;
  clientConfig?: ClientConfig;
}

export const oauthStartClient = async ({
  provider,
  redirectURI = '',
  flags,
  oauthApp,
  clientConfig,
}: UseOAuthStartParams): Promise<void> => {
  const queryClient = getQueryClient();

  const { rpcRouteMagicOauthLoginWithRedirectStartEnabled, oauthV2Providers } = flags || {};

  if (!rpcRouteMagicOauthLoginWithRedirectStartEnabled || !oauthV2Providers?.providers?.includes(provider)) {
    logger.error('RPC route not enabled or provider not supported', {
      oauthStep: 'start',
      provider: provider,
      redirectURI: redirectURI,
      flags,
    });
    throw new NodeError('Invalid params', 'RPC route not enabled or provider not supported');
  }

  const redirectAllowList = clientConfig?.accessAllowlists.redirectUrl || [];
  const domainAllowList = clientConfig?.accessAllowlists.domain || [];
  const isInRedirectAllowlist = assertURLWithDomainAllowlist(redirectAllowList as string[], redirectURI);
  const isInDomainAllowlist = assertURLWithDomainAllowlist(domainAllowList as string[], redirectURI);
  const isAllowedUrl = redirectAllowList.length ? isInRedirectAllowlist : isInDomainAllowlist;
  if (domainAllowList.length > 0 && !isAllowedUrl) {
    logger.error('Redirect URI not in allowlist', {
      oauthStep: 'start',
      provider: provider,
      redirectURI: redirectURI,
      redirectAllowList,
      domainAllowList,
      flags,
    });
    throw new NodeError('Invalid params', 'Redirect URI not in allowlist');
  }

  if (oauthApp?.id) {
    queryClient.setQueryData(magicClientQueryKeys.oauthApp({ provider }), [oauthApp]);
  } else {
    await queryClient.prefetchQuery({
      queryKey: magicClientQueryKeys.oauthApp({ provider }),
      queryFn: makeOAuthAppFetcher(),
      staleTime: 1000 * 60 * 8,
      gcTime: 1000 * 60 * 15,
    });
  }
};
