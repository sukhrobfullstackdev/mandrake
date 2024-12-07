import { EXPORT_KEY_PARAMS_INVALID } from '@app/api-wallets/rpc/user/magic_export_key/__constants__';
import ExportKeyPage from '@app/api-wallets/rpc/user/magic_export_key/export_private_key/page';
import { useExportPrivateKey } from '@hooks/data/export-key';
import { ApiWalletAtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { decryptPemKey, generatePemRSAKeyPair } from '@lib/utils/web-crypto';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';

const mockReplace = jest.fn();

jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('@hooks/data/export-key', () => ({
  useExportPrivateKey: jest.fn().mockReturnValue({
    mutateAsync: jest.fn(),
  }),
}));

jest.mock('@lib/utils/web-crypto', () => ({
  generatePemRSAKeyPair: jest.fn(),
  decryptPemKey: jest.fn(),
}));

jest.mock('@lib/atomic-rpc-payload', () => ({
  ApiWalletAtomicRpcPayloadService: {
    getActiveRpcPayload: jest.fn(),
  },
}));

function setup() {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <ExportKeyPage />
    </QueryClientProvider>,
  );
}

describe('Export Private Key', () => {
  it('renders a header', async () => {
    await act(() => {
      setup();
    });
    const content = screen.getByText('Wallet Private Key');
    expect(content).toBeInTheDocument();
  });

  it('shows a close button and close icon button when navigated to through the SDK method', async () => {
    await act(async () => {
      await setup();
    });
    const closeButtons = screen.getAllByRole('button', { name: /Close/i });
    expect(closeButtons.length).toBe(2);
  });

  it('renders a invalid params error', async () => {
    (ApiWalletAtomicRpcPayloadService.getActiveRpcPayload as any).mockReturnValue({
      params: [{}],
    });
    await act(async () => {
      await setup();
    });
    const content = screen.getByText(EXPORT_KEY_PARAMS_INVALID);
    expect(content).toBeInTheDocument();
  });

  it('renders a failed error', async () => {
    (ApiWalletAtomicRpcPayloadService.getActiveRpcPayload as any).mockReturnValue({
      params: [
        {
          encryptionContext: 'test',
          keyShard: 'test',
          walletId: 'test',
          exportRequestId: 'test',
        },
      ],
    });
    await act(async () => {
      await setup();
    });
    const content = await screen.getByText('Export key failed.');
    expect(content).toBeInTheDocument();
  });

  it('renders a private key', async () => {
    (ApiWalletAtomicRpcPayloadService.getActiveRpcPayload as any).mockReturnValue({
      params: [
        {
          encryptionContext: 'test',
          keyShard: 'test',
          walletId: 'test',
          exportRequestId: 'test',
        },
      ],
    });

    const mockMutateAsync = jest.fn().mockResolvedValue({
      private_key: 'mock-encrypted-private-key',
    });

    (useExportPrivateKey as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
    });

    const publicKeyPem = 'mock-public-key';
    const privateKeyPem = 'mock-private-key';
    const decryptedKey = 'mock-decrypted-private-key';

    (generatePemRSAKeyPair as jest.Mock).mockResolvedValue({
      publicKeyPem,
      privateKeyPem,
    });

    (decryptPemKey as jest.Mock).mockResolvedValue(decryptedKey);

    await act(async () => {
      await setup();
    });

    const description = await screen.getByText(
      'Store this in a secure place that only you can access and do not share it with anyone.',
    );
    const privateKey = await screen.getByText(decryptedKey);

    expect(privateKey).toBeInTheDocument();
    expect(description).toBeInTheDocument();
  });
});
