import { RevealViewType } from '@components/reveal-private-key/__type__';
import RevealKeyHeader from '@components/reveal-private-key/reveal-key-header';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';

const mockReplace = jest.fn();

jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('@lib/atomic-rpc-payload', () => ({
  AtomicRpcPayloadService: {
    getActiveRpcPayload: jest.fn(),
  },
  ApiWalletAtomicRpcPayloadService: { getActiveRpcPayload: jest.fn() },
}));

function setup(type: RevealViewType = RevealViewType.REVEAL) {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <RevealKeyHeader type={type} />
    </QueryClientProvider>,
  );
}

describe('Reveal Private Key Header', () => {
  it('shows a close button when navigated to through the SDK method', () => {
    setup();
    const closeButton = screen.getByRole('button', { name: /Close/i });
    expect(closeButton).toBeInTheDocument();
  });

  it('shows a logout button when navigated to through the legacy route', () => {
    (AtomicRpcPayloadService.getActiveRpcPayload as any).mockReturnValue({ params: [{ isLegacyFlow: true }] });
    setup();
    const logoutButton = screen.getByRole('button', { name: /Logout/i });
    expect(logoutButton).toBeInTheDocument();
  });

  it('logout button navigates to logout route when passed legacy param', () => {
    (AtomicRpcPayloadService.getActiveRpcPayload as any).mockReturnValue({ params: [{ isLegacyFlow: true }] });
    setup();
    const logoutButton = screen.getByRole('button', { name: /Logout/i });
    act(() => {
      logoutButton.click();
    });
    expect(mockReplace).toHaveBeenCalledWith('/send/rpc/auth/magic_auth_logout');
  });

  it('logout button navigates to MWS logout route when passed legacy and MWS params', () => {
    (AtomicRpcPayloadService.getActiveRpcPayload as any).mockReturnValue({
      params: [{ isLegacyFlow: true, isMWS: true }],
    });
    setup();
    const logoutButton = screen.getByRole('button', { name: /Logout/i });
    act(() => {
      logoutButton.click();
    });
    expect(mockReplace).toHaveBeenCalledWith('/send/rpc/user/magic_reveal_key/mws_logout');
  });

  it('shows a close button when type === EXPORT', () => {
    setup(RevealViewType.EXPORT);
    const closeButton = screen.getByRole('button', { name: /Close/i });
    expect(closeButton).toBeInTheDocument();
  });

  it('shows a close button when navigated to through the legacy route but type === EXPORT', () => {
    (AtomicRpcPayloadService.getActiveRpcPayload as any).mockReturnValue({ params: [{ isLegacyFlow: true }] });
    setup(RevealViewType.EXPORT);
    const logoutButton = screen.getByRole('button', { name: /Close/i });
    expect(logoutButton).toBeInTheDocument();
  });
});
