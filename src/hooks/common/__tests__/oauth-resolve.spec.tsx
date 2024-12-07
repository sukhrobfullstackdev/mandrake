import { useStore } from '@hooks/store';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { useOAuthResolve } from '../oauth-resolve';

jest.mock('@aws-sdk/client-cognito-identity', () => ({
  CognitoIdentityClient: jest.fn(),
  GetIdCommand: jest.fn(),
  GetCredentialsForIdentityCommand: jest.fn(),
}));

jest.mock('@aws-sdk/client-kms', () => ({
  KMSClient: jest.fn(),
  DecryptCommand: jest.fn(),
}));

jest.mock('@hooks/common/hydrate-or-create-wallets', () => ({
  useHydrateOrCreateWallets: jest.fn().mockImplementation(() => ({ walletCreationError: '' })),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

// jest.mock('@hooks/common/create-did-token-for-user', () => ({
//   useCreateDidTokenForUser: jest.fn().mockImplementation(() => ({ didToken: '12345', error: false })),
// }));

interface SetupParams {
  provider?: string | null;
}

const setup = ({ provider = 'google' }: SetupParams = {}) => {
  const queryClient = new QueryClient(TEST_CONFIG);

  useStore.setState({ authUserId: 'abc123', authUserSessionToken: '12345' });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return renderHook(() => useOAuthResolve({ provider: provider || undefined, scope: 'email' }), { wrapper });
};

describe('useOAuthResolve', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial data and error as null', () => {
    const { result } = setup();

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
