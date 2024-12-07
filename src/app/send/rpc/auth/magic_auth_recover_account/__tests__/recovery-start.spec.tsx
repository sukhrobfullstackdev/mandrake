import RecoverAccountStart from '@app/send/rpc/auth/magic_auth_recover_account/start/page';
import { MagicApiErrorCode } from '@constants/error';
import { useResetAuthState } from '@hooks/common/auth-state';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { StoreState, initialState, useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { ApiResponseError } from '@lib/http-services/core/api-response-error';
import { JsonRpcRequestPayload } from '@magic-sdk/types';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

const mockShowUI = jest.fn();
const mockResetAuthState = jest.fn();
const mockHydrateAndPersistAuthState = jest.fn().mockImplementation(() => Promise.resolve());
const mockRejectActiveRpcRequest = jest.fn();
const mockReplace = jest.fn();
const mockFetchFactorList = jest.fn().mockImplementation((_params, { onSuccess }) => {
  onSuccess?.({
    0: {
      factor_id: 'test factor id',
      type: 'phone_number',
      value: '+1********96',
    },
  });
});
const mockSendSms = jest.fn().mockImplementation((_params, { onSuccess }) => onSuccess?.());
const mockVerifySms = jest.fn();
const mockOnEvent = jest.fn();

jest.mock('@lib/message-channel/iframe/iframe-message-service', () => ({
  IFrameMessageService: {
    showOverlay: mockShowUI,
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

jest.mock('@hooks/common/hydrate-session', () => ({
  useHydrateSession: jest.fn().mockImplementation(() => ({ isError: true, isComplete: true })),
}));

jest.mock('@hooks/common/json-rpc-request', () => ({
  useRejectActiveRpcRequest: jest.fn().mockImplementation(() => mockRejectActiveRpcRequest),
  useResolveActiveRpcRequest: jest.fn().mockImplementation(() => jest.fn()),
}));

jest.mock('@hooks/common/auth-state', () => ({
  useResetAuthState: jest.fn().mockImplementation(() => ({
    resetAuthState: mockResetAuthState,
  })),
  useSetAuthState: jest.fn().mockImplementation(() => ({
    hydrateAndPersistAuthState: mockHydrateAndPersistAuthState,
  })),
}));

jest.mock('@app/send/rpc/auth/magic_auth_recover_account/__hooks__/sms-recovery-attempt', () => ({
  useGetFactorMutation: jest.fn().mockImplementation(() => ({
    data: [],
    isPending: false,
    error: null,
    mutate: mockFetchFactorList,
  })),
  useSendSmsMutation: jest.fn().mockImplementation(() => ({
    data: { attemptId: 'test' },
    isPending: false,
    error: null,
    mutate: mockSendSms,
  })),
  useVerifyOtpMutation: jest.fn().mockImplementation(() => ({
    data: [],
    isPending: false,
    error: null,
    mutate: mockVerifySms,
    reset: jest.fn(),
  })),
}));

jest.mock('@lib/atomic-rpc-payload', () => ({
  AtomicRpcPayloadService: {
    onEvent: jest.fn().mockImplementation((event, callback) => mockOnEvent(event, callback)),
    emitJsonRpcEventResponse: jest.fn(),
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

const initialPayload = {
  method: 'magic_auth_recover_account',
  params: [{ email: 'test@email.com' }],
  jsonrpc: '2.0',
  id: 1,
};

function setup(
  activeRpcPayload: JsonRpcRequestPayload = initialPayload,
  hydrateSession = { isError: true, isComplete: true },
  state: Partial<StoreState> = initialState,
) {
  const queryClient = new QueryClient(TEST_CONFIG);

  useStore.setState({
    ...state,
  });
  (AtomicRpcPayloadService.getActiveRpcPayload as any).mockReturnValue(activeRpcPayload);
  (AtomicRpcPayloadService.getEncodedQueryParams as any).mockReturnValue('test');

  (useResetAuthState as jest.Mock).mockImplementation(() => ({
    resetAuthState: mockResetAuthState,
  }));

  (useHydrateSession as jest.Mock).mockImplementation(() => hydrateSession);

  return render(
    <QueryClientProvider client={queryClient}>
      <RecoverAccountStart />
    </QueryClientProvider>,
  );
}

describe('Recover account start page', () => {
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
      { isError: false, isComplete: true },
      {
        ...initialState,
        email: 'test@email.com',
      },
    );

    expect(mockOnEvent).toHaveBeenCalledWith('verify-otp-code', expect.any(Function));
    expect(mockOnEvent).toHaveBeenCalledWith('resend-sms-otp', expect.any(Function));
  });
  it('should fetch factorId', () => {
    setup(
      {
        method: 'magic_auth_recover_account',
        params: [{ email: 'test@email.com', showUI: true }],
        jsonrpc: '2.0',
        id: 1,
      },
      { isError: false, isComplete: true },
      {
        ...initialState,
        email: 'test@email.com',
      },
    );

    expect(mockFetchFactorList).toHaveBeenCalled();
  });
  it('should send sms', () => {
    setup(
      {
        method: 'magic_auth_recover_account',
        params: [{ email: 'test@email.com', showUI: true }],
        jsonrpc: '2.0',
        id: 1,
      },
      { isError: false, isComplete: true },
      {
        ...initialState,
        email: 'test@email.com',
      },
    );

    expect(mockSendSms).toHaveBeenCalled();
  });
  it('should navigate to /throttled if login is throttled', () => {
    mockSendSms.mockImplementationOnce((_params, { onError }) => {
      const throttleError = new Error('Login throttled for at least 30 seconds.') as ApiResponseError;
      throttleError.response = {
        status: 'failed',
        status_code: 429,
        headers: {},
        data: {
          message: 'Login throttled for at least 30 seconds.',
        },
        error_code: MagicApiErrorCode.LOGIN_THROTTLED,
        message: 'Login throttled for at least 30 seconds.',
      };

      onError?.(throttleError);
    });

    setup(
      {
        method: 'magic_auth_recover_account',
        params: [{ email: 'test@email.com', showUI: true }],
        jsonrpc: '2.0',
        id: 1,
      },
      { isError: false, isComplete: true },
      {
        ...initialState,
        email: 'test@email.com',
      },
    );

    expect(mockReplace).toHaveBeenCalledWith('/send/rpc/auth/magic_auth_recover_account/throttled');
    expect(AtomicRpcPayloadService.emitJsonRpcEventResponse).toHaveBeenCalledWith('login-throttled');
  });
  it('should reject active rpc request if error code is not LOGIN_THROTTLED', () => {
    mockSendSms.mockImplementationOnce((_params, { onError }) => {
      const throttleError = new Error('Internal server error') as ApiResponseError;
      throttleError.response = {
        status: 'failed',
        status_code: 500,
        headers: {},
        data: {
          message: 'Internal server error',
        },
        error_code: MagicApiErrorCode.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      };

      onError?.(throttleError);
    });

    setup(
      {
        method: 'magic_auth_recover_account',
        params: [{ email: 'test@email.com', showUI: true }],
        jsonrpc: '2.0',
        id: 1,
      },
      { isError: false, isComplete: true },
      {
        ...initialState,
        email: 'test@email.com',
      },
    );

    expect(mockRejectActiveRpcRequest).toHaveBeenCalled();
  });
  it('should reject active rpc request if verify otp < 6', () => {
    mockOnEvent.mockImplementationOnce((event, callback) => {
      if (event === 'verify-otp-code') {
        callback('12345');
      }
    });
    setup(
      {
        method: 'magic_auth_recover_account',
        params: [{ email: 'test@email.com', showUI: true }],
        jsonrpc: '2.0',
        id: 1,
      },
      { isError: false, isComplete: true },
      {
        ...initialState,
        email: 'test@email.com',
      },
    );

    expect(AtomicRpcPayloadService.emitJsonRpcEventResponse).toHaveBeenCalledWith('invalid-sms-otp', [
      {
        errorMessage: 'Invalid code, please try again.',
        errorCode: MagicApiErrorCode.INCORRECT_VERIFICATION_CODE,
      },
    ]);
  });
  it('should call verifySms if otp > 6 and has attemptId', () => {
    mockOnEvent.mockImplementationOnce((event, callback) => {
      if (event === 'verify-otp-code') {
        callback('123456');
      }
    });
    setup(
      {
        method: 'magic_auth_recover_account',
        params: [{ email: 'test@email.com', showUI: true }],
        jsonrpc: '2.0',
        id: 1,
      },
      { isError: false, isComplete: true },
      {
        ...initialState,
        email: 'test@email.com',
      },
    );

    expect(mockVerifySms).toHaveBeenCalled();
  });
  it('should navigate to account recovered if verification successfull', async () => {
    mockOnEvent.mockImplementationOnce((event, callback) => {
      if (event === 'verify-otp-code') {
        callback('123456');
      }
    });

    mockVerifySms.mockImplementationOnce((_params, { onSuccess }) => {
      onSuccess?.({
        credential: 'test credential',
      });
    });

    setup(
      {
        method: 'magic_auth_recover_account',
        params: [{ email: 'test@email.com', showUI: true }],
        jsonrpc: '2.0',
        id: 1,
      },
      { isError: false, isComplete: true },
      {
        ...initialState,
        email: 'test@email.com',
      },
    );

    await expect(mockHydrateAndPersistAuthState).toHaveBeenCalled();
    expect(AtomicRpcPayloadService.emitJsonRpcEventResponse).toHaveBeenCalledWith('sms-verified');
    expect(mockReplace).toHaveBeenCalledWith('/send/rpc/auth/magic_auth_recover_account/account-recovered');
  });
  it('should emit invalid sms otp if verify otp fails', () => {
    mockOnEvent.mockImplementationOnce((event, callback) => {
      if (event === 'verify-otp-code') {
        callback('123456');
      }
    });

    mockVerifySms.mockImplementationOnce((_params, { onError }) => {
      const verifyError = new Error('Invalid code, please try again.') as ApiResponseError;
      verifyError.response = {
        status: 'failed',
        status_code: 500,
        headers: {},
        data: {
          message: 'Invalid code, please try again.',
        },
        error_code: MagicApiErrorCode.INCORRECT_VERIFICATION_CODE,
        message: 'Invalid code, please try again.',
      };

      onError?.(verifyError);
    });

    setup(
      {
        method: 'magic_auth_recover_account',
        params: [{ email: 'test@email.com', showUI: true }],
        jsonrpc: '2.0',
        id: 1,
      },
      { isError: false, isComplete: true },
      {
        ...initialState,
        email: 'test@email.com',
      },
    );

    expect(AtomicRpcPayloadService.emitJsonRpcEventResponse).toHaveBeenCalledWith('invalid-sms-otp', [
      { errorCode: 'INCORRECT_VERIFICATION_CODE', errorMessage: 'Invalid code, please try again.' },
    ]);
  });
});
