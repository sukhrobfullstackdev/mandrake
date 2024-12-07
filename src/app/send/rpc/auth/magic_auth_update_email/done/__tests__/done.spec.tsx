import UpdatedEmailDone from '@app/send/rpc/auth/magic_auth_update_email/done/page';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';

const mockReplace = jest.fn();
const mockReject = jest.fn();
const mockResolve = jest.fn();

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: jest.fn(() => '/send/rpc/auth/magic_auth_update_email/done'),
}));

jest.mock('@hooks/common/json-rpc-request', () => ({
  useResolveActiveRpcRequest: jest.fn().mockImplementation(() => mockResolve),
  useRejectActiveRpcRequest: jest.fn().mockImplementation(() => mockReject),
}));

function setup(method: string) {
  const queryClient = new QueryClient(TEST_CONFIG);

  AtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: method,
    id: 'my_id',
    params: [{ email: 'test@mgail.com' }],
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <UpdatedEmailDone />
    </QueryClientProvider>,
  );
}

describe('UpdateEmailDone', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to magic_auth_settings when Close button is clicked', async () => {
    setup('magic_auth_settings');
    const button = screen.getByText('Close');
    act(() => button.click());

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/send/rpc/user/magic_auth_settings');
    });
  });

  it('navigates to  when Close button is clicked', async () => {
    setup('magic_auth_update_email');
    const button = screen.getByText('Close');
    act(() => button.click());

    await waitFor(() => {
      expect(mockReplace).not.toHaveBeenCalled();
      expect(mockResolve).toHaveBeenCalledWith(true);
    });
  });
});
