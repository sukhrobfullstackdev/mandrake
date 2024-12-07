import OAuthCredentialCreate from '@app/v1/oauth2/credential/create/resolve/page';
import { LegacyOAuthSendCredentialResponse } from '@hooks/data/embedded/legacy-oauth/fetchers';
import { OAuthSendCredentialKey, legacyOAuthQueryKeys } from '@hooks/data/embedded/legacy-oauth/keys';
import {
  mockLegacyOAuthClientMetaCookie,
  mockLegacyOAuthCredentialSendResponse,
  mockLegacyOAuthErrorSendResponse,
} from '@mocks/oauth';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import * as nextCookies from 'cookies-next';
import qs from 'qs';

const MOCK_DID_TOKEN = '12345';

jest.mock('@aws-sdk/client-cognito-identity', () => ({
  CognitoIdentityClient: jest.fn(),
  GetIdCommand: jest.fn(),
  GetCredentialsForIdentityCommand: jest.fn(),
}));

jest.mock('@aws-sdk/client-kms', () => ({
  KMSClient: jest.fn(),
  DecryptCommand: jest.fn(),
}));

jest.mock('@lib/message-channel/resolve-json-rpc-response', () => ({
  resolveJsonRpcResponse: jest.fn(),
}));

jest.mock('@hooks/common/hydrate-session', () => ({
  useHydrateSession: jest.fn().mockImplementation(() => ({ isError: false, isComplete: true })),
}));

jest.mock('@hooks/common/hydrate-or-create-wallets', () => ({
  useHydrateOrCreateWallets: jest.fn().mockImplementation(() => ({
    areWalletsCreated: true,
    walletCreationError: '',
  })),
}));

jest.mock('@hooks/common/create-did-token-for-user', () => ({
  useCreateDidTokenForUser: jest.fn().mockImplementation(() => ({ didToken: MOCK_DID_TOKEN, error: false })),
}));

jest.mock('@hooks/common/oauth-safari-check', () => ({
  useCheckSafariCookie: jest.fn().mockReturnValue(true),
}));

type SetupParams = {
  sendCredentialData?: LegacyOAuthSendCredentialResponse | null;
  sendErrorData?: LegacyOAuthSendCredentialResponse | null;
  oauthClientMetaCookie?: any | null;
};

const setup = ({ sendCredentialData, sendErrorData = null, oauthClientMetaCookie }: SetupParams = {}) => {
  const queryClient = new QueryClient(TEST_CONFIG);

  if (sendCredentialData !== null) {
    queryClient.setQueryData<LegacyOAuthSendCredentialResponse, OAuthSendCredentialKey>(
      legacyOAuthQueryKeys.sendCredential({ resultQuery: qs.stringify({ magic_credential: MOCK_DID_TOKEN }) }),
      sendCredentialData || mockLegacyOAuthCredentialSendResponse,
    );
  }

  if (sendErrorData !== null) {
    queryClient.setQueryData<LegacyOAuthSendCredentialResponse>(
      legacyOAuthQueryKeys.sendError({
        errorQuery: qs.stringify({
          error: 'TEST_ERROR',
          error_description: 'There was a problem',
        }),
      }),
      sendErrorData || mockLegacyOAuthErrorSendResponse,
    );
  }

  if (oauthClientMetaCookie !== null) {
    jest.spyOn(nextCookies, 'getCookie').mockImplementation(() => {
      return oauthClientMetaCookie || mockLegacyOAuthClientMetaCookie;
    });
  }

  return render(
    <QueryClientProvider client={queryClient}>
      <OAuthCredentialCreate />
    </QueryClientProvider>,
  );
};

describe('OAuthLoginWithRedirect', () => {
  beforeEach(() => {
    jest.resetModules();

    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('component and loading spinner render successfully', () => {
    setup();
    expect(screen.getByTestId('legacy-oauth-credential-create-resolve-wrapper')).toBeInTheDocument();
  });

  it('if successful, redirect to correct redirect URI', async () => {
    setup();
    await waitFor(() => {
      expect(window.location.href).toBe('http://test.magic.link');
    });
  });

  it('if there was an error, it should redirect to correct error URI', async () => {
    const mockResponse = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            message: 'Something bad happened',
          }),
        ok: true,
        text: () => Promise.resolve('foo'),
        clone: () => mockResponse,
      }),
    );
    // @ts-expect-error no need to exhaustively type mock
    global.fetch = mockResponse;

    setup({
      sendCredentialData: null,
      sendErrorData: mockLegacyOAuthErrorSendResponse,
    });

    await waitFor(() => {
      expect(window.location.href).toBe('/error?error=server_error&error_description=Something%20bad%20happened');
    });
  });
});
