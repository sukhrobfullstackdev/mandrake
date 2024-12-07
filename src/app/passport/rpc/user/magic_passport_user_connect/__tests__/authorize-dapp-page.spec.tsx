import AuthorizeDappPage from '@app/passport/rpc/user/magic_passport_user_connect/authorize_dapp/page';
import { rejectPopupRequest, resolvePopupRequest } from '@hooks/common/popup/popup-json-rpc-request';
import { usePassportStore } from '@hooks/data/passport/store';
import { PopupAtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

jest.mock('@hooks/passport/use-smart-account', () => ({
  useSmartAccount: () => ({
    smartAccount: { address: '0x8ba1f109551bd432803012645ac136ddd64dba72' },
  }),
}));

const mockUsePassportAuthorizeMutation = jest.fn().mockResolvedValue({
  code: 'codes',
  state: 'state',
});

const mockUsePassportOauthTokenMutation = jest.fn().mockResolvedValue(() => ({
  publicAddress: 'publicAddress',
  walletId: 'walletId',
  id: 'id',
}));

jest.mock('@hooks/data/passport/app-config', () => ({
  usePassportAppConfig: jest.fn().mockReturnValue({
    name: 'Prestige World Wide',
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  }),
}));

jest.mock('@app/passport/libs/tee/kernel-client', () => ({
  getSmartAccount: jest.fn().mockResolvedValue({
    name: 'Prestige World Wide',
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  }),
}));

jest.mock('@hooks/data/passport/oauth-authorize', () => ({
  usePassportAuthorizeMutation: jest.fn().mockImplementation(() => ({
    mutateAsync: mockUsePassportAuthorizeMutation,
    isPending: false,
    isError: false,
    isSuccess: true,
  })),
}));

jest.mock('@hooks/data/passport/oauth-token', () => ({
  usePassportOauthTokenMutation: jest.fn().mockImplementation(() => ({
    mutateAsync: mockUsePassportOauthTokenMutation,
    isPending: false,
    isError: false,
    isSuccess: false,
    reset: jest.fn(),
  })),
}));

jest.mock('@hooks/common/popup/popup-json-rpc-request', () => ({
  rejectPopupRequest: jest.fn(),
  resolvePopupRequest: jest.fn(),
}));

function setup() {
  usePassportStore.setState({
    magicApiKey: 'pk_live_41A3F3BA36087648',
    accessToken:
      'eyJhbGciOiJSUzI1NiIsImtpZCI6Im15LWtleS1pZC0xMjMiLCJ0eXAiOiJKV1QifQ.eyJzdWIiOiJhY2ExZGJjMS0xMGYxLTRmMWEtOWMyYi0yY2M5ZmUwMWM1ODIiLCJleHAiOjE3MjYxMDYzNzEsInZlcmlmaWVkX2ZhY3RvcnMiOlt7ImZhY3Rvcl9pZCI6Ijk2MThlYzA2LWE4Y2QtNDA5Ni1iYzY1LTYzYjZlZmE3MTc5YyIsImZhY3Rvcl90eXBlIjoicGFzc2tleSIsInZlcmlmaWVkX2F0IjoiMjAyNC0wOS0xMlQwMDo1OTozMS41MDU0MTcrMDA6MDAifV19.GVy8sCslzSlV6Im5MtCE2Uj3ieMqLoooyg5-nTI0RIc9jniYSm6rknqSmZkDU68d8dOkHpuwftyGRYpOAW2-Yph4kn1hVb3J3De16XDfSylpYRL_UoR2etKzCEXtH8kdgO87hxqt8UwOp48xQmCSG61iTFTqtLwKOXGFeGhoYZEAU0hJzkfb9bnhi7z-9TEhYq_AUsQeDcGjJjUQDPjBSWN0jKdrE2NQscZhFg-BSsPFNiid8LzQXBuueQYtRozuqDqoqwZs15XyZuknVfDQCyW3zBqxA-SzvDP10uTMDGs2VpC-7VdrBuwql-denXdqsKBRXWCOXxM4ke7iVyprAg',
    decodedQueryParams: { network: { id: 11155111, rpcUrls: [] } } as any,
  });
  PopupAtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_passport_user_connect',
    id: 1,
    params: [],
  });

  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthorizeDappPage />
    </QueryClientProvider>,
  );
}

describe('Magic Passport Authorize dApp Page', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dApp name', () => {
    setup();
    expect(screen.getByText('Prestige World Wide')).toBeInTheDocument();
  });

  it('calls rejectPopupRequest when cancel is clicked', () => {
    setup();
    const cancelButton = screen.getAllByRole('button')?.[0];
    expect(cancelButton).toBeInTheDocument();
    act(() => {
      cancelButton?.click();
    });
    expect(rejectPopupRequest).toHaveBeenCalled();
    expect(resolvePopupRequest).not.toHaveBeenCalled();
  });

  it('calls usePassportAuthorizeMutation when connect is clicked', async () => {
    setup();
    const connectButton = screen.getByText('Connect').closest('button');
    expect(connectButton).toBeInTheDocument();
    await act(() => {
      connectButton?.click();
    });
    expect(mockUsePassportAuthorizeMutation).toHaveBeenCalled();
    expect(mockUsePassportOauthTokenMutation).toHaveBeenCalled();
    expect(rejectPopupRequest).not.toHaveBeenCalled();
    expect(resolvePopupRequest).toHaveBeenCalled();
  });
});
