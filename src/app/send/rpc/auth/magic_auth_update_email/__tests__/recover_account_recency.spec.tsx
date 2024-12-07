import RecoverAccountRecency from '@app/send/rpc/auth/magic_auth_update_email/recover_account_recency/page';
import { StoreState, initialState, useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { JsonRpcRequestPayload } from '@magic-sdk/types';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

const mockReplace = jest.fn();
const mockSetUpdateEmailState = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

jest.mock('@lib/atomic-rpc-payload', () => ({
  AtomicRpcPayloadService: {
    onEvent: jest.fn(),
    setActiveRpcPayload: jest.fn(),
    getActiveRpcPayload: jest.fn(),
    getEncodedQueryParams: jest.fn(),
  },
}));

jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('@app/send/rpc/auth/magic_auth_update_email/update-email-context', () => {
  return {
    useUpdateEmailContext: jest.fn().mockImplementation(() => {
      return {
        setUpdateEmailState: mockSetUpdateEmailState,
      };
    }),
  };
});

const initialPayload = {
  method: 'magic_auth_recover_account',
  params: [{ email: 'test@email.com', showUI: false, credential: 'test' }],
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
      <RecoverAccountRecency />
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

  it('should navigate to /input_address after setting the state', () => {
    setup(
      {
        method: 'magic_auth_update_email',
        params: [{ email: 'test@email.com', showUI: true, credential: 'test' }],
        jsonrpc: '2.0',
        id: 1,
      },
      {
        ...initialState,
        email: 'test@email.com',
      },
    );

    expect(mockReplace).toHaveBeenCalledWith('/send/rpc/auth/magic_auth_update_email/input_address');
    expect(mockSetUpdateEmailState).toHaveBeenCalledWith({
      updateEmailCredential: 'test',
      setUpdateEmailState: mockSetUpdateEmailState,
    });
  });
});
