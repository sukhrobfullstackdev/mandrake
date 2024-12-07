import { oauthStartClient } from '@lib/server/oauth-start-client';
import { getQueryClient } from '@lib/common/query-client';
import { assertURLWithDomainAllowlist } from '@lib/utils/assert-url';
import { ClientConfig } from '@custom-types/magic-client';
import { magicClientQueryKeys } from '@hooks/data/embedded/magic-client';

jest.mock('@lib/common/query-client');
jest.mock('@lib/utils/assert-url');
jest.mock('@hooks/data/embedded/magic-client');

const mockSetQueryData = jest.fn();
const mockPrefetchQuery = jest.fn();

jest.mock('@hooks/common/client-config', () => ({
  useClientConfigAccessAllowlists: jest.fn(),
  useRejectActiveRpcRequest: jest.fn(),
}));

describe('oauthStartClient', () => {
  const mockQueryClient = {
    setQueryData: mockSetQueryData,
    prefetchQuery: mockPrefetchQuery,
  };

  beforeEach(() => {
    (getQueryClient as jest.Mock).mockReturnValue(mockQueryClient);
    jest.clearAllMocks();
  });
  it('sets the query data when oauthApp.id is provided', async () => {
    const oauthApp = { id: 'test-oauth-app', appId: 'test-app-id', redirectId: 'test-redirect-id' };
    const flags = {
      rpcRouteMagicOauthLoginWithRedirectStartEnabled: true,
      oauthV2Providers: { providers: ['google'] },
    };

    await oauthStartClient({ provider: 'google', redirectURI: 'https://redirect.com', flags, oauthApp });

    expect(mockSetQueryData).toHaveBeenCalledWith(
      magicClientQueryKeys.oauthApp({ provider: 'google' }), // Ensure the correct query key
      [oauthApp], // Ensure the array contains the correct oauthApp object
    );
  });

  it('prefetches the query data when oauthApp is not provided', async () => {
    const flags = {
      rpcRouteMagicOauthLoginWithRedirectStartEnabled: true,
      oauthV2Providers: { providers: ['google'] },
    };

    await oauthStartClient({ provider: 'google', redirectURI: 'https://redirect.com', flags });

    expect(mockPrefetchQuery).toHaveBeenCalledWith({
      queryKey: magicClientQueryKeys.oauthApp({ provider: 'google' }), // Ensure queryKey is correct
      staleTime: 480000, // Use actual staleTime value
      gcTime: 900000, // Use actual gcTime value
    });
  });

  it('throws an error when flags are undefined', async () => {
    await expect(oauthStartClient({ provider: 'google' })).rejects.toThrowError(
      'RPC route not enabled or provider not supported',
    );
  });
  it('resolves if alllowlist is empty', async () => {
    const flags = {
      rpcRouteMagicOauthLoginWithRedirectStartEnabled: true,
      oauthV2Providers: { providers: ['google'] },
    };

    (assertURLWithDomainAllowlist as jest.Mock).mockReturnValue(false);

    await expect(
      oauthStartClient({ provider: 'google', redirectURI: 'https://not-allowed.com', flags }),
    ).resolves.not.toThrowError();
  });
  it('does not perform allowlist checks when allowListRedirectUrl and allowListDomainUrl are empty', async () => {
    const flags = {
      rpcRouteMagicOauthLoginWithRedirectStartEnabled: true,
      oauthV2Providers: { providers: ['google'] },
    };
    const config = {
      accessAllowlists: {
        redirectUrl: [],
        domain: ['localhost'],
        bundle: [],
      },
    } as unknown as ClientConfig;
    await expect(
      oauthStartClient({
        provider: 'google',
        flags,
        redirectURI: 'https://any-url.com',
        clientConfig: config,
      }),
    ).rejects.toThrowError('Redirect URI not in allowlist');
  });
  it('does not throw an error if redirect URI is missing and allowlist is empty', async () => {
    const flags = {
      rpcRouteMagicOauthLoginWithRedirectStartEnabled: true,
      oauthV2Providers: { providers: ['google'] },
    };

    await expect(
      oauthStartClient({ provider: 'google', flags, redirectURI: 'hello', doRedirectUrlCheck: false }),
    ).resolves.not.toThrow();
  });
  it('proceeds without error when the redirect URI passes the allowlist check', async () => {
    const flags = {
      rpcRouteMagicOauthLoginWithRedirectStartEnabled: true,
      oauthV2Providers: { providers: ['google'] },
    };

    (assertURLWithDomainAllowlist as jest.Mock).mockReturnValue(true); // Simulate a valid allowlist check

    await expect(
      oauthStartClient({ provider: 'google', flags, redirectURI: 'https://allowed.com' }),
    ).resolves.not.toThrow();
  });
  it('throws an error when oauthV2Providers is undefined', async () => {
    const flags = {
      rpcRouteMagicOauthLoginWithRedirectStartEnabled: true,
      oauthV2Providers: undefined, // No providers
    };

    await expect(
      oauthStartClient({ provider: 'google', redirectURI: 'https://redirect.com', flags }),
    ).rejects.toThrowError('RPC route not enabled or provider not supported');
  });
  it('throws an error when oauthV2Providers is an empty array', async () => {
    const flags = {
      rpcRouteMagicOauthLoginWithRedirectStartEnabled: true,
      oauthV2Providers: { providers: [] }, // No providers allowed
    };

    await expect(
      oauthStartClient({ provider: 'google', redirectURI: 'https://redirect.com', flags }),
    ).rejects.toThrowError('RPC route not enabled or provider not supported');
  });
  it('resolves if the redirect URI is in the allowListRedirectUrl', async () => {
    const flags = {
      rpcRouteMagicOauthLoginWithRedirectStartEnabled: true,
      oauthV2Providers: { providers: ['google'] },
    };

    const clientConfig = {
      accessAllowlists: {
        redirectUrl: ['https://allowed.com'],
        domain: [],
        bundle: [],
      },
    } as unknown as ClientConfig;

    await expect(
      oauthStartClient({
        provider: 'google',
        redirectURI: 'https://allowed.com',
        flags,
        clientConfig,
      }),
    ).resolves.not.toThrow();
  });
  it('resolves if both redirect and domain allowlist checks pass', async () => {
    const flags = {
      rpcRouteMagicOauthLoginWithRedirectStartEnabled: true,
      oauthV2Providers: { providers: ['google'] },
    };

    const clientConfig = {
      accessAllowlists: {
        redirectUrl: ['https://allowed.com'],
        domain: ['allowed.com'],
      },
    } as ClientConfig;

    await expect(
      oauthStartClient({
        provider: 'google',
        redirectURI: 'https://allowed.com',
        flags,
        clientConfig,
      }),
    ).resolves.not.toThrow();
  });

  it('handles multiple providers correctly', async () => {
    const flags = {
      rpcRouteMagicOauthLoginWithRedirectStartEnabled: true,
      oauthV2Providers: { providers: ['google', 'facebook'] },
    };

    await expect(
      oauthStartClient({ provider: 'google', flags, redirectURI: 'https://redirect.com' }),
    ).resolves.not.toThrow();
  });
  it('throws an error if provider is in the list', async () => {
    const flags = {
      rpcRouteMagicOauthLoginWithRedirectStartEnabled: true,
      oauthV2Providers: { providers: ['google', 'facebook'] },
    };

    await expect(
      oauthStartClient({ provider: 'telegram', flags, redirectURI: 'https://redirect.com' }),
    ).rejects.toThrowError('RPC route not enabled or provider not supported');
  });
  it('handles missing clientConfig without errors', async () => {
    const flags = {
      rpcRouteMagicOauthLoginWithRedirectStartEnabled: true,
      oauthV2Providers: { providers: ['google'] },
    };

    await expect(
      oauthStartClient({ provider: 'google', flags, redirectURI: 'https://redirect.com' }),
    ).resolves.not.toThrow();
  });
  it('throws an error when flags are undefined', async () => {
    await expect(oauthStartClient({ provider: 'google' })).rejects.toThrowError(
      'RPC route not enabled or provider not supported',
    );
  });
  it('throws an error if rpcRouteMagicOauthLoginWithRedirectStartEnabled flag is disabled', async () => {
    const flags = {
      rpcRouteMagicOauthLoginWithRedirectStartEnabled: false,
      oauthV2Providers: { providers: ['google'] },
    };

    await expect(oauthStartClient({ provider: 'google', flags })).rejects.toThrowError(
      'RPC route not enabled or provider not supported',
    );
  });

  it('throws an error if provider is not in the allowed providers list', async () => {
    const flags = {
      rpcRouteMagicOauthLoginWithRedirectStartEnabled: true,
      oauthV2Providers: { providers: ['facebook'] },
    };

    await expect(oauthStartClient({ provider: 'google', flags })).rejects.toThrowError(
      'RPC route not enabled or provider not supported',
    );
  });
});
