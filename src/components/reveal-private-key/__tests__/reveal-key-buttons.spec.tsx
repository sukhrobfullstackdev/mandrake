import { RevealViewType } from '@components/reveal-private-key/__type__';
import RevealKeyButtons from '@components/reveal-private-key/reveal-key-buttons';
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

jest.mock('@magiclabs/ui-components', () => {
  const actual = jest.requireActual('@magiclabs/ui-components');
  return {
    ...actual,
    IcoEyeOpened: () => <svg data-testid="ico-eye-opened" />,
    IcoEyeClosed: () => <svg data-testid="ico-eye-closed" />,
  };
});

jest.mock('@lib/atomic-rpc-payload', () => ({
  AtomicRpcPayloadService: {
    getActiveRpcPayload: jest.fn(),
  },
}));

function setup(mockBoolean: boolean, type: RevealViewType = RevealViewType.REVEAL) {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <RevealKeyButtons
        handleCopy={() => {}}
        handleRevealPrivateKey={() => {}}
        isCopied={mockBoolean}
        isHidden={mockBoolean}
        type={type}
      />
    </QueryClientProvider>,
  );
}

describe('Reveal Key Buttons', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('copy button shows "Copy" text when isCopied is false', () => {
    setup(false);
    const content = screen.getByText('Copy');
    expect(content).toBeInTheDocument();
  });

  it('copy button shows "Copied" text when isCopied is true', () => {
    setup(true);
    const content = screen.getByText('Copied');
    expect(content).toBeInTheDocument();
  });

  it('reveal button shows "Hide" text and closed eye icon when isHidden is false', () => {
    setup(false);
    const content = screen.getByText('Hide');
    expect(content).toBeInTheDocument();
    const closedEyeIcon = screen.getByTestId('ico-eye-closed');
    expect(closedEyeIcon).toBeInTheDocument();
    const openEyeIcon = screen.queryByTestId('ico-eye-opened');
    expect(openEyeIcon).not.toBeInTheDocument();
  });

  it('reveal button shows "Reveal" text and open eye icon when isHidden is true', () => {
    setup(true);
    const content = screen.getByText('Reveal');
    expect(content).toBeInTheDocument();
    const openEyeIcon = screen.getByTestId('ico-eye-opened');
    expect(openEyeIcon).toBeInTheDocument();
    const closedEyeIcon = screen.queryByTestId('ico-eye-closed');
    expect(closedEyeIcon).not.toBeInTheDocument();
  });

  it('shows a logout button when navigated to through the legacy route', () => {
    (AtomicRpcPayloadService.getActiveRpcPayload as any).mockReturnValue({ params: [{ isLegacyFlow: true }] });
    setup(false);
    const logoutButton = screen.getByRole('button', { name: /Log Out/i });
    expect(logoutButton).toBeInTheDocument();
  });

  it('logout button navigates to logout route when passed legacy param', () => {
    (AtomicRpcPayloadService.getActiveRpcPayload as any).mockReturnValue({ params: [{ isLegacyFlow: true }] });
    setup(false);
    const logoutButton = screen.getByRole('button', { name: /Log Out/i });
    act(() => {
      logoutButton.click();
    });
    expect(mockReplace).toHaveBeenCalledWith('/send/rpc/auth/magic_auth_logout');
  });

  it('logout button navigates to MWS logout route when passed legacy and MWS params', () => {
    (AtomicRpcPayloadService.getActiveRpcPayload as any).mockReturnValue({
      params: [{ isLegacyFlow: true, isMWS: true }],
    });
    setup(false);
    const logoutButton = screen.getByRole('button', { name: /Log Out/i });
    act(() => {
      logoutButton.click();
    });
    expect(mockReplace).toHaveBeenCalledWith('/send/rpc/user/magic_reveal_key/mws_logout');
  });

  it('logout button navigates to logout route when passed legacy param', () => {
    (AtomicRpcPayloadService.getActiveRpcPayload as any).mockReturnValue({
      params: [{ isLegacyFlow: true, isMWS: false }],
    });
    setup(false);
    const logoutButton = screen.getByRole('button', { name: /Log Out/i });
    act(() => {
      logoutButton.click();
    });
    expect(mockReplace).toHaveBeenCalledWith('/send/rpc/auth/magic_auth_logout');
  });
});
