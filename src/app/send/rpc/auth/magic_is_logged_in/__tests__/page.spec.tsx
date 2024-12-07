import IsLoggedIn from '@app/send/rpc/auth/magic_is_logged_in/page';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
  usePathname: jest.fn(() => '/send/rpc/auth/magic_is_logged_in'),
}));

jest.mock('@aws-sdk/client-cognito-identity', () => ({
  CognitoIdentityClient: jest.fn(),
  GetIdCommand: jest.fn(),
  GetCredentialsForIdentityCommand: jest.fn(),
}));

jest.mock('@aws-sdk/client-kms', () => ({
  KMSClient: jest.fn(),
  DecryptCommand: jest.fn(),
}));

jest.mock('@hooks/common/hydrate-session', () => ({
  useHydrateSession: () => ({
    isError: false,
    isComplete: true,
  }),
}));

jest.mock('@hooks/common/hydrate-or-create-wallets', () => ({
  useHydrateOrCreateWallets: () => ({
    walletCreationError: '',
    areWalletsCreated: true,
  }),
}));

function setup() {
  AtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_is_logged_in',
    id: 'my_id',
    params: [],
  });
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <IsLoggedIn />
    </QueryClientProvider>,
  );
}

describe('Magic Is Logged In Page', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders null', async () => {
    const { container } = setup();
    await waitFor(() => {
      expect(container.childElementCount).toEqual(0);
    });
  });
});
