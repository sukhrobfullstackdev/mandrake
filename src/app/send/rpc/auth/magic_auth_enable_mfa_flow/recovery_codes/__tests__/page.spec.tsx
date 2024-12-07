import EnableMfaRecoveryCodes from '@app/send/rpc/auth/magic_auth_enable_mfa_flow/recovery_codes/page';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { JsonRpcRequestPayload } from '@magic-sdk/types';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: jest.fn(() => '/send/rpc/auth/magic_auth_enable_mfa_flow/recovery_codes'),
}));

function setup(payload: JsonRpcRequestPayload) {
  AtomicRpcPayloadService.setActiveRpcPayload(payload);
  const queryClient = new QueryClient(TEST_CONFIG);
  useStore.setState({
    mfaRecoveryCodes: ['recovery code'],
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <EnableMfaRecoveryCodes />
    </QueryClientProvider>,
  );
}

describe('Page', () => {
  beforeEach(() => {
    (global.navigator as any).clipboard = {
      writeText: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to /send/idle when finish setup button is clicked', async () => {
    setup({ method: 'magic_auth_enable_mfa_flow', jsonrpc: '2.0', id: 1 });
    const button = screen.getByText('Finish setup');
    act(() => button.click());

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/send/idle');
    });
  });

  it('navigates to settings when finish setup button is clicked', async () => {
    setup({ method: 'magic_auth_settings', jsonrpc: '2.0', id: 1 });
    const button = screen.getByText('Finish setup');
    act(() => button.click());

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/send/rpc/user/magic_auth_settings');
    });
  });

  it('copies the recovery code when the button is clicked', () => {
    setup({ method: 'magic_auth_settings', jsonrpc: '2.0', id: 1 });
    const button = screen.getByText('Copy code');
    act(() => button.click());
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('recovery code');
  });
});
