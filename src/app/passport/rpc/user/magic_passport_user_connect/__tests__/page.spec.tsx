import PassportLoginStartPage from '@app/passport/rpc/user/magic_passport_user_connect/page';
import { PopupAtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { arePasskeysSupported } from '@lib/passkeys/are-passkeys-supported';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';

const mockPrefetch = jest.fn();
const mockReplace = jest.fn();

jest.mock('@http-services', () => ({
  Magic: {
    Post: jest.fn(),
  },
}));

jest.mock('@hooks/common/passport-router', () => ({
  usePassportRouter: () => ({
    prefetch: mockPrefetch,
    replace: mockReplace,
  }),
}));

jest.mock('@hooks/common/launch-darkly', () => ({
  useFlags: jest.fn(),
}));

jest.mock('@lib/passkeys/are-passkeys-supported');

function executeRequest() {
  PopupAtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_passport_user_connect',
    id: '1',
    params: [],
  });

  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <PassportLoginStartPage />
    </QueryClientProvider>,
  );
}

describe('create passport button', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('does not render when passkeys are not supported', async () => {
    (arePasskeysSupported as jest.Mock).mockResolvedValue(false);

    await act(async () => {
      await executeRequest();
    });

    expect(screen.queryByText('Create Passport')).not.toBeInTheDocument();
    expect(mockPrefetch).not.toHaveBeenCalled();
  });

  it('renders correctly when passkeys are supported', async () => {
    (arePasskeysSupported as jest.Mock).mockResolvedValue(true);

    await act(async () => {
      await executeRequest();
    });

    expect(screen.getByText('Create Passport')).toBeInTheDocument();
    expect(mockPrefetch).toHaveBeenCalledWith('/passport/rpc/user/magic_passport_user_connect/passkey_sign_in');
    expect(mockPrefetch).toHaveBeenCalledWith('/passport/rpc/user/magic_passport_user_connect/passkey_sign_up');
  });
});
