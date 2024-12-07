import ShowNFTsPage from '@app/send/rpc/wallet/magic_show_nfts/page';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';

jest.mock('@hooks/common/hydrate-session', () => ({
  useHydrateSession: jest.fn(),
}));

jest.mock('@hooks/common/json-rpc-request', () => ({
  useRejectActiveRpcRequest: jest.fn(),
  useResolveActiveRpcRequest: jest.fn(),
}));

jest.mock('@lib/message-channel/iframe/iframe-message-service', () => ({
  IFrameMessageService: {
    showOverlay: jest.fn(),
  },
}));

jest.mock('@lib/common/query-client', () => ({
  getQueryClient: jest.fn(() => new QueryClient(TEST_CONFIG)),
}));

function setup() {
  const queryClient = new QueryClient(TEST_CONFIG);
  return render(
    <QueryClientProvider client={queryClient}>
      <ShowNFTsPage />
    </QueryClientProvider>,
  );
}

describe('ShowNFTsPage', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the page content correctly', () => {
    (useHydrateSession as jest.Mock).mockReturnValue({
      isComplete: true,
      isError: false,
    });

    setup();
    expect(screen.getByText('Collectibles')).toBeInTheDocument();
  });

  it('calls rejectActiveRpcRequest if session hydration fails', async () => {
    const mockRejectActiveRpcRequest = jest.fn();
    const mockUseResolveActiveRpcRequest = jest.fn();

    (useHydrateSession as jest.Mock).mockReturnValue({
      isComplete: true,
      isError: true,
    });
    (useRejectActiveRpcRequest as jest.Mock).mockReturnValue(mockRejectActiveRpcRequest);
    (useResolveActiveRpcRequest as jest.Mock).mockReturnValue(mockUseResolveActiveRpcRequest);

    setup();

    await waitFor(() =>
      expect(mockRejectActiveRpcRequest).toHaveBeenCalledWith(
        RpcErrorCode.InternalError,
        RpcErrorMessage.UserDeniedAccountAccess,
      ),
    );
  });

  it('calls showOverlay if session hydration succeeds', async () => {
    (useHydrateSession as jest.Mock).mockReturnValue({
      isComplete: true,
      isError: false,
    });

    setup();

    await waitFor(() => expect(IFrameMessageService.showOverlay).toHaveBeenCalled());
  });
});
