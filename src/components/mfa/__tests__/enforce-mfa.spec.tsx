import { MagicApiErrorCode } from '@constants/error';
import { useVerifyTemporaryOtpMutation } from '@hooks/data/embedded/mfa';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { ApiResponseError } from '@lib/http-services/core/api-response-error';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import EnforceMFA from '../enforce-mfa';

const mockReplace = jest.fn();
const mockGet = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSearchParams: () => ({
    get: mockGet,
  }),
  usePathname: jest.fn(() => '/send/rpc/auth/some_magic_auth_url'),
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

jest.mock('@lib/message-channel/resolve-json-rpc-response', () => ({
  resolveJsonRpcResponse: jest.fn(),
}));

jest.mock('@hooks/common/hydrate-session', () => ({
  useHydrateSession: jest.fn().mockImplementation(() => ({ isError: false, isComplete: true })),
}));

jest.mock('@hooks/common/hydrate-or-create-wallets', () => ({
  useHydrateOrCreateWallets: jest.fn().mockImplementation(() => ({ walletCreationError: '' })),
}));

jest.mock('@hooks/data/embedded/mfa', () => ({
  useVerifyTemporaryOtpMutation: jest.fn().mockImplementation(() => ({
    mutate: jest.fn(),
    isPending: false,
    error: null,
    reset: jest.fn(),
    isSuccess: false,
  })),
  useSendEmailOtpStartQuery: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
}));

jest.mock('@hooks/common/create-did-token-for-user', () => ({
  useCreateDidTokenForUser: jest.fn().mockImplementation(() => ({ didToken: '' })),
}));

jest.mock('@hooks/data/embedded/user', () => ({
  useUserLogoutQuery: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
}));

jest.mock('@hooks/common/json-rpc-request', () => ({
  useResolveActiveRpcRequest: jest.fn(() => {
    mockReplace('/send/idle');
    AtomicRpcPayloadService.setActiveRpcPayload(null);
  }),
  useRejectActiveRpcRequest: jest.fn(() => jest.fn()),
}));

function setup() {
  AtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_auth_enforce_mfa',
    id: 'my_id',
    params: [{ email: 'john@doe.com' }],
  });

  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <EnforceMFA onPressLostDevice={() => null} onSuccess={() => null} showLostDeviceButton />
    </QueryClientProvider>,
  );
}

describe('Enforce MFA', () => {
  beforeEach(() => {
    jest.resetModules(); // Reset cache
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders a pin code input', () => {
    setup();

    for (let i = 1; i <= 6; i++) {
      const inputElement = screen.getByLabelText(`mfa one time password input ${i}`);
      expect(inputElement).toBeInTheDocument();
    }
  });

  it('should display an error message when invalid OTP is entered', () => {
    (useVerifyTemporaryOtpMutation as jest.Mock).mockImplementation(() => ({
      mutate: jest.fn(),
      isPending: false,
      error: new ApiResponseError({
        error_code: MagicApiErrorCode.INCORRECT_VERIFICATION_CODE,
        status_code: 422,
        data: {
          message: '',
        },
        message: '',
        status: 'failed',
        headers: { test: 'test' },
      }),
      reset: jest.fn(),
      isSuccess: true,
    }));

    setup();
    const errorMessage = screen.getByText('Invalid code, please try again.');
    expect(errorMessage).toBeInTheDocument();
  });
});
