import Page from '@app/send/rpc/eth/eth_signTypedData_v3/page';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useClientConfigFeatureFlags } from '@hooks/common/client-config';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { DkmsService } from '@lib/dkms';
import Web3Service from '@lib/utils/web3-services/web3-service';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

const mockWalletInfoData = { publicAddress: '0x1234' };
const mockPrivateKey = 'foo';
const mockDoConfirmActionIfRequired = jest.fn(() => Promise.resolve());

// Mock hooks and services
jest.mock('@lib/atomic-rpc-payload');
jest.mock('@hooks/common/client-config');
jest.mock('@hooks/common/hydrate-session');
jest.mock('@hooks/common/json-rpc-request');
jest.mock('@utils/web3-services/web3-service');
jest.mock('@lib/dkms');
jest.mock('@hooks/common/confirm-action', () => ({
  useConfirmAction: jest
    .fn()
    .mockImplementation(() => ({ doConfirmActionIfRequired: mockDoConfirmActionIfRequired, isActionConfirmed: true })),
  formatMessageForConfirmTab: jest.fn(),
}));
jest.mock('@hooks/common/hydrate-or-create-wallets/wallet-info-and-credentials', () => ({
  getWalletInfoAndCredentials: () => ({
    awsCreds: 'foo',
    walletInfoData: mockWalletInfoData,
  }),
}));
jest.mock('@lib/utils/web3-services/web3-service');
jest.mock('@lib/message-channel/iframe/iframe-message-service');
jest.mock('@lib/dkms', () => ({
  DkmsService: {
    reconstructSecret: jest.fn(() => mockPrivateKey),
  },
}));
jest.mock('@hooks/store', () => ({
  useStore: jest.fn(selector =>
    selector({
      authUserId: 'testUserId',
      authUserSessionToken: 'testToken',
      decodedQueryParams: { domainOrigin: 'https://example.com' },
    }),
  ),
}));

function executeRequest() {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <Page />
    </QueryClientProvider>,
  );
}

describe('Page Component', () => {
  const mockResolveActiveRpcRequest = jest.fn();
  const mockRejectActiveRpcRequest = jest.fn();

  beforeEach(() => {
    (useResolveActiveRpcRequest as jest.Mock).mockReturnValue(mockResolveActiveRpcRequest);
    (useRejectActiveRpcRequest as jest.Mock).mockReturnValue(mockRejectActiveRpcRequest);
    (useHydrateSession as jest.Mock).mockReturnValue({ isComplete: true, isError: false });
    (useClientConfigFeatureFlags as jest.Mock).mockReturnValue({ isSigningUiEnabled: true });

    const activeRpcPayload = { params: ['0x1234', '{"test": "message"}'] };
    (AtomicRpcPayloadService.getActiveRpcPayload as jest.Mock).mockReturnValue(activeRpcPayload);

    (Web3Service.compareAddresses as jest.Mock).mockResolvedValue(Promise.resolve(true));
    (Web3Service.signTypedDataV3 as jest.Mock).mockResolvedValue('signature');
  });

  afterEach(() => jest.clearAllMocks());

  it('renders correctly when signing UI is disabled', async () => {
    (useClientConfigFeatureFlags as jest.Mock).mockReturnValue({ isSigningUiEnabled: false });

    await act(async () => {
      await executeRequest();
    });
    expect(screen.queryByText(/sign message/i)).toBeNull();
  });

  it('handles session hydration error', async () => {
    (useClientConfigFeatureFlags as jest.Mock).mockReturnValue({ isSigningUiEnabled: true });
    (useHydrateSession as jest.Mock).mockReturnValue({ isComplete: true, isError: true });

    await act(async () => {
      await executeRequest();
    });

    await waitFor(() => {
      expect(mockRejectActiveRpcRequest).toHaveBeenCalledWith(
        RpcErrorCode.InternalError,
        RpcErrorMessage.UserDeniedAccountAccess,
      );
    });
  });

  it('handles successful session hydration', async () => {
    (useClientConfigFeatureFlags as jest.Mock).mockReturnValue({ isSigningUiEnabled: true });

    await act(async () => {
      await executeRequest();
    });

    expect(screen.getByText(/Confirm Request/i)).toBeInTheDocument();
  });

  it('handles confirm action', async () => {
    (useClientConfigFeatureFlags as jest.Mock).mockReturnValue({ isSigningUiEnabled: true });

    await act(async () => {
      await executeRequest();
    });

    let confirmButton: HTMLElement;
    await waitFor(() => {
      confirmButton = screen.getByText('Confirm');
    });

    await act(async () => {
      await fireEvent.click(confirmButton);
      expect(confirmButton).not.toHaveAttribute('disabled');
    });
  });

  it('handles close action', async () => {
    (useClientConfigFeatureFlags as jest.Mock).mockReturnValue({ isSigningUiEnabled: true });

    await act(async () => {
      await executeRequest();
    });

    await waitFor(() => {
      const closeButton = screen.getByText('Cancel');
      fireEvent.click(closeButton);
      expect(mockRejectActiveRpcRequest).toHaveBeenCalledWith(
        RpcErrorCode.InternalError,
        RpcErrorMessage.UserDeniedSigning,
      );
    });
  });

  it('displays error message on failure', async () => {
    (DkmsService.reconstructSecret as jest.Mock).mockRejectedValueOnce(new Error('test error'));

    await act(async () => {
      await executeRequest();
    });

    await waitFor(() => {
      const errorMessage = screen.getByText('An error occurred. Please try again.');
      expect(errorMessage).toBeInTheDocument();
    });
  });
});
