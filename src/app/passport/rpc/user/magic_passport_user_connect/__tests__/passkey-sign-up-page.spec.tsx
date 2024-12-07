import PasskeySignUpPage from '@app/passport/rpc/user/magic_passport_user_connect/passkey_sign_up/page';
import { PassportPageErrorCodes } from '@constants/passport-page-errors';
import { PASSPORT_ERROR_URL } from '@constants/routes';
import { usePassportStore } from '@hooks/data/passport/store';
import { PopupAtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render } from '@testing-library/react';

const mockPrefetch = jest.fn();
const mockReplace = jest.fn();

const mockedMutate = jest.fn().mockResolvedValue({
  status: 'string',
  verifyFlowId: 'string',
  data: {
    rp: {
      name: 'string',
      id: 'string',
    },
    user: {
      id: 'string',
      name: 'string',
      displayName: 'string',
    },
    challenge: 'string',
    pubKeyCredParams: [],
    timeout: 60000,
    excludeCredentials: [],
    attestation: 'string',
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

jest.mock('@hooks/data/passport/passkey-start', () => ({
  UserAuthFactorType: {
    Passkey: 'passkey',
  },
  usePasskeyCreateChallenge: jest.fn().mockImplementation(() => ({
    mutateAsync: mockedMutate,
    isError: false,
    isPending: false,
    error: null,
    reset: jest.fn(),
    isSuccess: false,
  })),
}));

jest.mock('@app/passport/rpc/user/components/create-passport-button', () => ({
  createPublicKeyCredentialCreationOptions: jest.fn().mockReturnValue({
    challenge: 'challenge',
    rp: {
      id: 'rpId',
    },
    user: {
      id: 'userId',
      name: 'username',
      displayName: 'displayName',
    },
    pubKeyCredParams: [],
    timeout: 60000,
    excludeCredentials: [],
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification: 'required',
    },
    attestation: 'none',
  }),
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

function setup() {
  PopupAtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_passport_user_connect',
    id: 1,
    params: [],
  });

  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <PasskeySignUpPage />
    </QueryClientProvider>,
  );
}

describe('Magic Passport Passkey Sign Up Page', () => {
  beforeEach(() => {
    jest.resetModules();

    (global.navigator as any).credentials = {
      create: jest.fn().mockResolvedValue({
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('handlePasskeySignUp is called', async () => {
    await act(async () => {
      await setup();
    });
    expect(mockedMutate).toHaveBeenCalled();
  });

  it('handlePasskeySignUp is called', async () => {
    await act(async () => {
      await setup();
    });
    expect(mockPasskeyLoginVerify).toHaveBeenCalled();
    expect(usePassportStore.getState().accessToken).toBe('someAccessToken');
    expect(usePassportStore.getState().refreshToken).toBe('aFreshRefreshToken');
    expect(mockReplace).toHaveBeenCalledWith('/passport/rpc/user/magic_passport_user_connect/create_eoa_wallet');
  });

  it('handlePasskeySignUp is called and credentials failed to create', async () => {
    await act(async () => {
      (global.navigator as any).credentials = {
        create: jest.fn().mockResolvedValue(null),
      };
      await setup();
    });
    expect(mockReplace).toHaveBeenCalledWith(PASSPORT_ERROR_URL(PassportPageErrorCodes.ACCOUNT_CREATION_FAILED));
  });
});
