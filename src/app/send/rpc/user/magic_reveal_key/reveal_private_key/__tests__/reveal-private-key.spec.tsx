import RevealPrivateKeyPage from '@app/send/rpc/user/magic_reveal_key/reveal_private_key/page';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { DkmsService } from '@lib/dkms';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

const mockReplace = jest.fn();
const mockWalletInfoData = { publicAddress: '0x1234' };
const mockPrivateKey = 'foo';

jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('@lib/atomic-rpc-payload', () => ({
  AtomicRpcPayloadService: {
    getActiveRpcPayload: jest.fn().mockReturnValue({
      params: [{ isLegacyFlow: false }],
    }),
  },
}));

jest.mock('@lib/dkms', () => ({
  DkmsService: {
    reconstructSecretWithUserSession: jest.fn(() =>
      Promise.resolve({
        walletInfoData: mockWalletInfoData,
        privateKey: mockPrivateKey,
      }),
    ),
  },
}));

jest.mock('@hooks/store', () => ({
  useStore: jest.fn(selector =>
    selector({
      magicApiKey: 'testApiKey',
      authUserId: 'testUserId',
      isGlobalAppScope: true,
      authUserSessionToken: 'testToken',
      decodedQueryParams: { domainOrigin: 'https://example.com' },
    }),
  ),
}));

jest.mock('@hooks/common/client-config', () => ({
  useAssetUri: jest.fn(() => 'mocked-asset-uri'),
}));

jest.mock('@lib/utils/network-name', () => ({
  getWalletType: jest.fn(() => 'ETH'),
}));

jest.mock('@hooks/common/json-rpc-request');

function setup() {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <RevealPrivateKeyPage />
    </QueryClientProvider>,
  );
}

describe('Reveal Private Key', () => {
  beforeEach(() => {
    jest.resetModules();
    document.execCommand = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders a header', async () => {
    await act(async () => {
      await setup();
    });
    const content = screen.getByText('Wallet Private Key');
    expect(content).toBeInTheDocument();
  });

  it('renders a description', async () => {
    await act(async () => {
      await setup();
    });
    const content = screen.getByText(
      'Store this in a secure place that only you can access and do not share it with anyone.',
    );
    expect(content).toBeInTheDocument();
  });

  it('shows a close button and close icon button when navigated to through the SDK method', async () => {
    await act(async () => {
      await setup();
    });
    const closeButtons = screen.getAllByRole('button', { name: /Close/i });
    expect(closeButtons.length).toBe(2);
  });

  it("doesn't show a header button when navigated to through the legacy route", async () => {
    (AtomicRpcPayloadService.getActiveRpcPayload as any).mockReturnValue({
      params: [{ isLegacyFlow: true }],
    });
    await act(async () => {
      await setup();
    });
    const closeButton = screen.queryByRole('button', { name: /Close/i });
    const logoutButton = screen.queryByRole('button', { name: /Logout/i });
    expect(closeButton).not.toBeInTheDocument();
    expect(logoutButton).not.toBeInTheDocument();
  });

  it('copies the private key when handleCopy is called', async () => {
    (DkmsService.reconstructSecretWithUserSession as jest.Mock).mockResolvedValue({
      privateKey: 'mocked-private-key',
      walletInfoData: {},
    });

    await act(async () => {
      await setup();
    });

    const copyButton = screen.getByText('Copy');
    await act(() => {
      fireEvent.click(copyButton);
    });

    await waitFor(() => expect(copyButton).toBeInTheDocument());
  });
});
