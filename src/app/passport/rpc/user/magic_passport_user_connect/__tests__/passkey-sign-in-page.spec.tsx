import PasskeySignInPage from '@app/passport/rpc/user/magic_passport_user_connect/passkey_sign_in/page';
import { usePassportStore } from '@hooks/data/passport/store';
import { PopupAtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render } from '@testing-library/react';

const mockPrefetch = jest.fn();
const mockReplace = jest.fn();

const mockPasskeyChallenge = jest.fn().mockResolvedValue({
  data: {
    challenge: 'challenge',
    rpId: 'rpId',
    timeout: 60000,
    userVerification: 'required',
    verifyFlowId: 'verifyFlowId',
  },
});

const mockPasskeyLoginVerify = jest.fn().mockResolvedValue({
  accessToken: 'someAccessToken',
  refreshToken: 'aFreshRefreshToken',
});

jest.mock('@hooks/common/passport-router', () => ({
  usePassportRouter: () => ({
    prefetch: mockPrefetch,
    replace: mockReplace,
  }),
}));

jest.mock('@lib/utils/base64', () => ({
  base64UrlToArrayBuffer: jest.fn(),
  bufferToBase64url: jest.fn(),
}));

jest.mock('@hooks/data/passport/factor-challenge', () => ({
  usePasskeyChallengeMutation: jest.fn().mockImplementation(() => ({
    mutateAsync: mockPasskeyChallenge,
    isError: false,
    isPending: false,
    error: null,
    reset: jest.fn(),
    isSuccess: false,
  })),
}));

jest.mock('@hooks/data/passport/passkey-verify', () => ({
  usePassportPasskeyLoginVerify: jest.fn().mockImplementation(() => ({
    mutateAsync: mockPasskeyLoginVerify,
    isError: false,
    isPending: false,
    error: null,
    reset: jest.fn(),
    isSuccess: false,
  })),
}));

interface Params {
  existingCredentialId?: string | null;
  createCredentialError?: boolean;
}

function setup({ existingCredentialId, createCredentialError = false }: Params) {
  PopupAtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_passport_user_connect',
    id: 1,
    params: [],
  });

  if (createCredentialError) {
    (global.navigator as any).credentials = {
      get: jest.fn().mockRejectedValue(new Error('Error creating passkey')),
    };
  } else {
    (global.navigator as any).credentials = {
      get: jest.fn().mockResolvedValue({
        id: 'id',
        rawId: new Uint8Array([137]),
        response: {
          clientDataJSON: new Uint8Array(),
          authenticatorData: new Uint8Array(),
          signature: new Uint8Array(),
          userHandle: new Uint8Array(),
        },
        type: 'type',
      }),
    };
  }

  if (existingCredentialId) {
    usePassportStore.setState({ existingPasskeyCredentialIds: [existingCredentialId] });
  }

  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <PasskeySignInPage />
    </QueryClientProvider>,
  );
}

describe('Magic Passport Passkey Sign In Page', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('handlePasskeySignIn is not called if there is no existingCredentialId', async () => {
    await act(async () => {
      await setup({ existingCredentialId: null });
    });
    expect(mockPasskeyChallenge).toHaveBeenCalled();
    expect(mockPasskeyLoginVerify).toHaveBeenCalled();
  });

  it('handlePasskeySignIn is not called if there is an existingCredentialId', async () => {
    await act(async () => {
      await setup({ existingCredentialId: 'asdfa.lkj3.23r', createCredentialError: true });
    });
    expect(mockPasskeyChallenge).toHaveBeenCalled();
    expect(mockPasskeyLoginVerify).not.toHaveBeenCalled();
  });

  it('handlePasskeySignIn is called when there is an existingCredentialId', async () => {
    await act(async () => {
      await setup({ existingCredentialId: 'asdfa.lkj3.23r' });
    });
    expect(mockPasskeyChallenge).toHaveBeenCalled();
    expect(mockPasskeyLoginVerify).toHaveBeenCalled();
    expect(usePassportStore.getState().accessToken).toBe('someAccessToken');
    expect(usePassportStore.getState().refreshToken).toBe('aFreshRefreshToken');
    expect(mockReplace).toHaveBeenCalledWith('/passport/rpc/user/magic_passport_user_connect/get_eoa_wallet');
  });
});
