import AccountRecoveredPage from '@app/send/rpc/auth/magic_auth_recover_account/account-recovered/page';
import { StoreState, initialState, useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { JsonRpcRequestPayload } from '@magic-sdk/types';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

const mockRejectActiveRpcRequest = jest.fn();
const mockReplace = jest.fn();
const mockEmitJsonEvent = jest.fn();
const mockOnEvent = jest.fn();

jest.mock('@lib/atomic-rpc-payload', () => ({
  AtomicRpcPayloadService: {
    onEvent: jest.fn().mockImplementation((event, callback) => mockOnEvent(event, callback)),
    emitJsonRpcEventResponse: jest.fn().mockImplementation(event => mockEmitJsonEvent(event)),
    setActiveRpcPayload: jest.fn(),
    getActiveRpcPayload: jest.fn(),
    getEncodedQueryParams: jest.fn(),
  },
}));

jest.mock('@hooks/common/json-rpc-request', () => ({
  useRejectActiveRpcRequest: jest.fn().mockImplementation(() => mockRejectActiveRpcRequest),
  useResolveActiveRpcRequest: jest.fn().mockImplementation(() => jest.fn()),
}));

jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: () => ({
    replace: mockReplace,
  }),
}));

const initialPayload = {
  method: 'magic_auth_recover_account',
  params: [{ email: 'test@email.com' }],
  jsonrpc: '2.0',
  id: 1,
};

function setup(activeRpcPayload: JsonRpcRequestPayload = initialPayload, state: Partial<StoreState> = initialState) {
  const queryClient = new QueryClient(TEST_CONFIG);

  useStore.setState({
    ...state,
  });
  (AtomicRpcPayloadService.getActiveRpcPayload as any).mockReturnValue(activeRpcPayload);
  (AtomicRpcPayloadService.getEncodedQueryParams as any).mockReturnValue('test');

  return render(
    <QueryClientProvider client={queryClient}>
      <AccountRecoveredPage />
    </QueryClientProvider>,
  );
}

describe('Recover account initial page', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should set up event listeners', () => {
    setup(
      {
        method: 'magic_auth_recover_account',
        params: [{ email: 'test@email.com', showUI: true }],
        jsonrpc: '2.0',
        id: 1,
      },
      {
        ...initialState,
        email: 'test@email.com',
        authUserSessionToken: 'ust',
      },
    );

    expect(mockEmitJsonEvent).toHaveBeenCalledWith('account-recovered');
    expect(mockOnEvent).toHaveBeenCalledWith('update-email', expect.any(Function));
  });
});
