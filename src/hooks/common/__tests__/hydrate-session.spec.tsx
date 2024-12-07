import { getQueryClient } from '@common/query-client';
import { WalletType } from '@custom-types/wallet';
import { UseHydrateSessionReturn, useHydrateSession } from '@hooks/common/hydrate-session';
import { useRefreshSessionMutation } from '@hooks/data/embedded/session';
import {
  useUserSessionTokenFromRefreshTokenMutation,
  useVerifyUserSessionMutation,
  userQueryKeys,
} from '@hooks/data/embedded/user';
import { StoreState, initialState, useStore } from '@hooks/store';
import { QueryClientProvider } from '@tanstack/react-query';
import { RenderHookResult, act, renderHook } from '@testing-library/react';
import localforage from 'localforage';
import { ReactNode } from 'react';
const mockedUseVerifyUserSessionReject = jest.fn().mockRejectedValue(new Error('error'));

const mockedUseVerifyUserSessionResolve = jest.fn().mockResolvedValue({
  authUserId: 'testUserId',
  authUserSessionToken: 'authUserSessionToken',
  email: 'email',
  phoneNumber: 'phoneNumber',
});

const mockedUseUserSessionTokenFromRefreshTokenReject = jest.fn().mockRejectedValue(new Error('error'));

const mockedUseUserSessionTokenFromRefreshTokenResolve = jest.fn().mockResolvedValue({
  authUserId: 'testUserId',
  authUserSessionToken: 'authUserSessionToken',
  refreshToken: 'userSessionRefreshToken',
  email: 'email',
  phoneNumber: 'phoneNumber',
});

const mockedUseRefreshSessionResolve = jest.fn().mockResolvedValue({
  authUserId: 'authUserId',
  email: 'email',
  phoneNumber: 'phoneNumber',
  authUserSessionToken: 'authUserSessionToken',
});

const mockedUseRefreshSessionReject = jest.fn().mockRejectedValue(new Error('error'));

const mockedUsePersistSessionResolve = jest.fn().mockResolvedValue({
  authUserId: 'authUserId',
  email: 'email',
  phoneNumber: 'phoneNumber',
  authUserSessionToken: 'authUserSessionToken',
});

jest.mock('@hooks/data/embedded/user', () => ({
  useVerifyUserSessionMutation: jest.fn().mockImplementation(() => ({
    mutateAsync: mockedUseVerifyUserSessionResolve,
  })),
  useUserSessionTokenFromRefreshTokenMutation: jest.fn().mockImplementation(() => ({
    mutateAsync: mockedUseUserSessionTokenFromRefreshTokenResolve,
  })),

  userQueryKeys: {
    info: jest.fn(() => {
      return 'info';
    }),
  },
}));

jest.mock('@hooks/data/embedded/session', () => ({
  useRefreshSessionMutation: jest.fn().mockImplementation(() => ({
    mutateAsync: mockedUseRefreshSessionResolve,
  })),
  usePersistSessionMutation: jest.fn().mockImplementation(() => ({
    mutateAsync: mockedUsePersistSessionResolve,
  })),
}));

jest.mock('localforage', () => ({
  createInstance: jest.fn().mockReturnValue({
    defineDriver: jest.fn().mockResolvedValue(undefined),
    setDriver: jest.fn().mockResolvedValue(undefined),
    ready: jest.fn().mockResolvedValue(undefined),
    getItem: jest.fn().mockResolvedValue(undefined),
  }),
}));

const getItemMock = jest.fn();
const setItemMock = jest.fn();
const removeItemMock = jest.fn();
const setDriverMock = jest.fn();
const clearMock = jest.fn();
const lengthMock = jest.fn().mockReturnValue(2);

type SetupParams = {
  storeState?: Partial<StoreState>;
  rejectVerifyUserSession?: boolean;
  rejectUserSessionTokenFromRefreshToken?: boolean;
  rejectRefreshSession?: boolean;
};

const authUserId = 'testUserId';
const authUserSessionToken = 'testToken';
const queryClient = getQueryClient();

const setup = async ({
  storeState,
  rejectVerifyUserSession = false,
  rejectUserSessionTokenFromRefreshToken = false,
  rejectRefreshSession = false,
}: SetupParams = {}): Promise<SetupReturn> => {
  useStore.setState({ ...initialState, ...storeState });

  if (rejectVerifyUserSession) {
    (useVerifyUserSessionMutation as jest.Mock).mockImplementation(() => ({
      mutateAsync: mockedUseVerifyUserSessionReject,
    }));
  }

  if (rejectUserSessionTokenFromRefreshToken) {
    (useUserSessionTokenFromRefreshTokenMutation as jest.Mock).mockImplementation(() => ({
      mutateAsync: mockedUseUserSessionTokenFromRefreshTokenReject,
    }));
  }

  if (rejectRefreshSession) {
    (useRefreshSessionMutation as jest.Mock).mockImplementation(() => ({
      mutateAsync: mockedUseRefreshSessionReject,
    }));
  }

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  let hook: SetupReturn | unknown;

  await act(async () => {
    hook = await renderHook(() => useHydrateSession(), { wrapper });
  });

  return hook as SetupReturn;
};
type SetupReturn = RenderHookResult<UseHydrateSessionReturn, unknown>;

describe('useHydrateSession', () => {
  beforeEach(() => {
    (useVerifyUserSessionMutation as jest.Mock).mockImplementation(() => ({
      mutateAsync: mockedUseVerifyUserSessionResolve,
    }));

    (useUserSessionTokenFromRefreshTokenMutation as jest.Mock).mockImplementation(() => ({
      mutateAsync: mockedUseUserSessionTokenFromRefreshTokenResolve,
    }));

    (useRefreshSessionMutation as jest.Mock).mockImplementation(() => ({
      mutateAsync: mockedUseRefreshSessionResolve,
    }));
    (localforage.createInstance as jest.Mock).mockReturnValue({
      defineDriver: jest.fn(),
      setDriver: setDriverMock,
      ready: jest.fn().mockResolvedValue(undefined),
      getItem: getItemMock.mockResolvedValue('mocked value'),
      setItem: setItemMock,
      removeItem: removeItemMock,
      clear: clearMock,
      length: lengthMock,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  describe('verifyUserSessionMutation', () => {
    describe('should be called', () => {
      describe('should resolve', () => {
        test('when authUserId and authUserSessionToken are in state and user Info exists', async () => {
          queryClient.setQueryData(
            userQueryKeys.info({ authUserId, authUserSessionToken, walletType: WalletType.ETH }),
            'mockedData',
          );

          const { result } = await setup({
            storeState: {
              authUserId,
              authUserSessionToken,
            },
          });

          expect(mockedUseVerifyUserSessionResolve).not.toHaveBeenCalled();
          expect(mockedUseVerifyUserSessionReject).not.toHaveBeenCalled();

          // these won't be called because verify session resolved
          expect(mockedUseUserSessionTokenFromRefreshTokenResolve).not.toHaveBeenCalled();
          expect(mockedUseUserSessionTokenFromRefreshTokenReject).not.toHaveBeenCalled();

          expect(mockedUseRefreshSessionResolve).not.toHaveBeenCalled();
          expect(mockedUseRefreshSessionReject).not.toHaveBeenCalled();

          expect(result.current.isComplete).toBe(true);
          expect(result.current.isError).toBe(false);
        });
        test('when authUserId and authUserSessionToken are in state and verify session succeeds', async () => {
          const { result } = await setup({
            storeState: {
              authUserId: 'testUserId',
              authUserSessionToken: 'testToken',
            },
          });

          expect(mockedUseVerifyUserSessionResolve).toHaveBeenCalled();
          expect(mockedUseVerifyUserSessionReject).not.toHaveBeenCalled();

          // these won't be called because verify session resolved
          expect(mockedUseUserSessionTokenFromRefreshTokenResolve).not.toHaveBeenCalled();
          expect(mockedUseUserSessionTokenFromRefreshTokenReject).not.toHaveBeenCalled();

          expect(mockedUseRefreshSessionResolve).not.toHaveBeenCalled();
          expect(mockedUseRefreshSessionReject).not.toHaveBeenCalled();

          expect(result.current.isComplete).toBe(true);
          expect(result.current.isError).toBe(false);
        });
      });

      describe('should reject', () => {
        test('when authUserId and authUserSessionToken are in state and verify session fails', async () => {
          const { result } = await setup({
            storeState: {
              authUserId: 'testUserId',
              authUserSessionToken: 'testToken',
              decodedQueryParams: { sdkType: 'magic-sdk-rn' },
            },
            rejectVerifyUserSession: true,
          });

          expect(mockedUseVerifyUserSessionResolve).not.toHaveBeenCalled();
          expect(mockedUseVerifyUserSessionReject).toHaveBeenCalled();

          // these won't be called because verify session resolved
          expect(mockedUseUserSessionTokenFromRefreshTokenResolve).not.toHaveBeenCalled();
          expect(mockedUseUserSessionTokenFromRefreshTokenReject).not.toHaveBeenCalled();

          expect(mockedUseRefreshSessionResolve).toHaveBeenCalled();
          expect(mockedUseRefreshSessionReject).not.toHaveBeenCalled();

          expect(result.current.isComplete).toBe(true);
          expect(result.current.isError).toBe(false);
        });
      });
    });

    describe('should not be called', () => {
      test('when authUserId and authUserSessionToken are not in state', async () => {
        const { result } = await setup({ storeState: { decodedQueryParams: { sdkType: 'magic-sdk-ios' } } });

        // these won't be called because there is no authUserId or authUserSessionToken in state
        expect(mockedUseVerifyUserSessionResolve).not.toHaveBeenCalled();
        expect(mockedUseVerifyUserSessionReject).not.toHaveBeenCalled();

        // these won't be called because there is no sdkMetadata in state
        expect(mockedUseUserSessionTokenFromRefreshTokenResolve).not.toHaveBeenCalled();
        expect(mockedUseUserSessionTokenFromRefreshTokenReject).not.toHaveBeenCalled();

        expect(mockedUseRefreshSessionResolve).toHaveBeenCalled();

        expect(result.current.isComplete).toBe(true);
        expect(result.current.isError).toBe(false);
      });
    });
  });

  describe('userSessionTokenFromRefreshTokenMutation', () => {
    describe('should be called', () => {
      describe('should resolve', () => {
        test('when we have sdkMetaData in state and get user session token from refresh token succeeds', async () => {
          const { result } = await setup({
            storeState: {
              authUserId: null,
              authUserSessionToken: null,
              sdkMetaData: { webCryptoDpopJwt: 'webCryptoDpopJwt', userSessionRefreshToken: 'userSessionRefreshToken' },
            },
          });

          // this won't be called because there is no authUserId or authUserSessionToken in state
          expect(mockedUseVerifyUserSessionResolve).not.toHaveBeenCalled();
          expect(mockedUseVerifyUserSessionReject).not.toHaveBeenCalled();

          expect(mockedUseUserSessionTokenFromRefreshTokenResolve).toHaveBeenCalled();
          expect(mockedUseRefreshSessionResolve).not.toHaveBeenCalled();

          expect(result.current.isComplete).toBe(true);
          expect(result.current.isError).toBe(false);
        });

        test('when verify session fails but get user session token from refresh token succeeds', async () => {
          const { result } = await setup({
            storeState: {
              authUserId: 'authUserId',
              authUserSessionToken: 'authUserSessionToken',
              sdkMetaData: { webCryptoDpopJwt: 'webCryptoDpopJwt', userSessionRefreshToken: 'userSessionRefreshToken' },
            },
            rejectVerifyUserSession: true,
          });

          // this won't be called because there is no authUserId or authUserSessionToken in state
          expect(mockedUseVerifyUserSessionResolve).not.toHaveBeenCalled();
          expect(mockedUseVerifyUserSessionReject).toHaveBeenCalled();

          expect(mockedUseUserSessionTokenFromRefreshTokenResolve).toHaveBeenCalled();
          expect(mockedUseRefreshSessionResolve).not.toHaveBeenCalled();

          expect(result.current.isComplete).toBe(true);
          expect(result.current.isError).toBe(false);
        });
      });

      describe('should reject', () => {
        test('when we have sdkMetaData in state and get user session token from refresh token fails', async () => {
          const { result } = await setup({
            storeState: {
              authUserId: null,
              authUserSessionToken: null,
              sdkMetaData: { webCryptoDpopJwt: 'webCryptoDpopJwt', userSessionRefreshToken: 'userSessionRefreshToken' },
            },
            rejectUserSessionTokenFromRefreshToken: true,
          });

          // this won't be called because there is no authUserId or authUserSessionToken in state
          expect(mockedUseVerifyUserSessionResolve).not.toHaveBeenCalled();
          expect(mockedUseVerifyUserSessionReject).not.toHaveBeenCalled();

          expect(mockedUseUserSessionTokenFromRefreshTokenResolve).not.toHaveBeenCalled();
          expect(mockedUseUserSessionTokenFromRefreshTokenReject).toHaveBeenCalled();

          expect(mockedUseRefreshSessionResolve).not.toHaveBeenCalled();
          expect(mockedUseRefreshSessionReject).not.toHaveBeenCalled();

          expect(result.current.isComplete).toBe(true);
          expect(result.current.isError).toBe(true);
        });

        test('when verify session and get user session token from refresh token fails', async () => {
          const { result } = await setup({
            storeState: {
              authUserId: 'authUserId',
              authUserSessionToken: 'authUserSessionToken',
              sdkMetaData: { webCryptoDpopJwt: 'webCryptoDpopJwt', userSessionRefreshToken: 'userSessionRefreshToken' },
            },
            rejectVerifyUserSession: true,
            rejectUserSessionTokenFromRefreshToken: true,
          });

          // this won't be called because there is no authUserId or authUserSessionToken in state
          expect(mockedUseVerifyUserSessionResolve).not.toHaveBeenCalled();
          expect(mockedUseVerifyUserSessionReject).toHaveBeenCalled();

          expect(mockedUseUserSessionTokenFromRefreshTokenResolve).not.toHaveBeenCalled();
          expect(mockedUseUserSessionTokenFromRefreshTokenReject).toHaveBeenCalled();

          expect(mockedUseRefreshSessionResolve).not.toHaveBeenCalled();
          expect(mockedUseRefreshSessionReject).not.toHaveBeenCalled();

          expect(result.current.isComplete).toBe(true);
          expect(result.current.isError).toBe(true);
        });
      });
    });

    describe('should not be called', () => {
      test('if we are missing webCryptoDpopJwt', async () => {
        const { result } = await setup({
          storeState: {
            authUserId: null,
            authUserSessionToken: null,
            decodedQueryParams: { sdkType: 'magic-sdk-ios' },
            sdkMetaData: { webCryptoDpopJwt: undefined, userSessionRefreshToken: 'userSessionRefreshToken' },
          },
        });

        // this won't be called because there is no authUserId or authUserSessionToken in state
        expect(mockedUseVerifyUserSessionResolve).not.toHaveBeenCalled();
        expect(mockedUseVerifyUserSessionReject).not.toHaveBeenCalled();

        // this won't be called because there is no webCryptoDpopJwt in state
        expect(mockedUseUserSessionTokenFromRefreshTokenResolve).not.toHaveBeenCalled();
        expect(mockedUseUserSessionTokenFromRefreshTokenReject).not.toHaveBeenCalled();

        expect(mockedUseRefreshSessionResolve).toHaveBeenCalled();

        expect(result.current.isComplete).toBe(true);
        expect(result.current.isError).toBe(false);
      });

      test('if we are missing userSessionRefreshToken', async () => {
        const { result } = await setup({
          storeState: {
            authUserId: null,
            authUserSessionToken: null,
            decodedQueryParams: { sdkType: 'magic-sdk-flutter' },
            sdkMetaData: { webCryptoDpopJwt: 'webCryptoDpopJwt', userSessionRefreshToken: undefined },
          },
        });
        // this won't be called because there is no authUserId or authUserSessionToken in state
        expect(mockedUseVerifyUserSessionResolve).not.toHaveBeenCalled();
        expect(mockedUseVerifyUserSessionReject).not.toHaveBeenCalled();

        // this won't be called because there is no userSessionRefreshToken in state
        expect(mockedUseUserSessionTokenFromRefreshTokenResolve).not.toHaveBeenCalled();
        expect(mockedUseUserSessionTokenFromRefreshTokenReject).not.toHaveBeenCalled();

        expect(mockedUseRefreshSessionResolve).toHaveBeenCalled();

        expect(result.current.isComplete).toBe(true);
        expect(result.current.isError).toBe(false);
      });
    });
  });

  describe('useRefreshSessionMutation', () => {
    describe('should be called', () => {
      describe('should resolve', () => {
        test('when verify session fails and refresh session succeeds', async () => {
          const { result } = await setup({
            storeState: {
              authUserId: 'authUserId',
              authUserSessionToken: 'authUserSessionToken',
              decodedQueryParams: { sdkType: 'magic-sdk-unity' },
            },
            rejectVerifyUserSession: true,
          });

          expect(mockedUseVerifyUserSessionResolve).not.toHaveBeenCalled();
          expect(mockedUseVerifyUserSessionReject).toHaveBeenCalled();

          // this won't be called be custom session persistence is not enabled
          expect(mockedUseUserSessionTokenFromRefreshTokenResolve).not.toHaveBeenCalled();
          expect(mockedUseUserSessionTokenFromRefreshTokenReject).not.toHaveBeenCalled();

          expect(mockedUseRefreshSessionResolve).toHaveBeenCalled();
          expect(mockedUseRefreshSessionReject).not.toHaveBeenCalled();

          expect(result.current.isComplete).toBe(true);
          expect(result.current.isError).toBe(false);
        });

        test('should only call refresh session', async () => {
          const { result } = await setup({
            storeState: {
              authUserId: null,
              authUserSessionToken: 'authUserSessionToken',
              decodedQueryParams: { sdkType: 'magic-sdk-ios' },
              sdkMetaData: {
                webCryptoDpopJwt: 'webCryptoDpopJwt',
                userSessionRefreshToken: undefined,
              },
            },
          });

          expect(mockedUseVerifyUserSessionResolve).not.toHaveBeenCalled();
          expect(mockedUseVerifyUserSessionReject).not.toHaveBeenCalled();

          expect(mockedUseUserSessionTokenFromRefreshTokenResolve).not.toHaveBeenCalled();
          expect(mockedUseUserSessionTokenFromRefreshTokenReject).not.toHaveBeenCalled();

          expect(mockedUseRefreshSessionResolve).toHaveBeenCalled();
          expect(mockedUseRefreshSessionReject).not.toHaveBeenCalled();

          expect(result.current.isComplete).toBe(true);
          expect(result.current.isError).toBe(false);
        });
      });

      describe('should reject', () => {
        test('when verify session and refresh session fails', async () => {
          const { result } = await setup({
            storeState: {
              authUserId: 'authUserId',
              authUserSessionToken: 'authUserSessionToken',
              decodedQueryParams: { sdkType: 'magic-sdk-ios' },
            },
            rejectVerifyUserSession: true,
            rejectRefreshSession: true,
          });

          expect(mockedUseVerifyUserSessionResolve).not.toHaveBeenCalled();
          expect(mockedUseVerifyUserSessionReject).toHaveBeenCalled();

          expect(mockedUseUserSessionTokenFromRefreshTokenResolve).not.toHaveBeenCalled();
          expect(mockedUseUserSessionTokenFromRefreshTokenReject).not.toHaveBeenCalled();

          expect(mockedUseRefreshSessionResolve).not.toHaveBeenCalled();
          expect(mockedUseRefreshSessionReject).toHaveBeenCalled();

          expect(result.current.isComplete).toBe(true);
          expect(result.current.isError).toBe(true);
        });
      });
    });

    describe('should not be called', () => {
      test('when verify session succeeds', async () => {
        const { result } = await setup({
          storeState: {
            authUserId: 'authUserId',
            authUserSessionToken: 'authUserSessionToken',
          },
        });

        expect(mockedUseVerifyUserSessionResolve).toHaveBeenCalled();
        expect(mockedUseVerifyUserSessionReject).not.toHaveBeenCalled();

        expect(mockedUseUserSessionTokenFromRefreshTokenResolve).not.toHaveBeenCalled();
        expect(mockedUseUserSessionTokenFromRefreshTokenReject).not.toHaveBeenCalled();

        expect(mockedUseRefreshSessionResolve).not.toHaveBeenCalled();
        expect(mockedUseRefreshSessionReject).not.toHaveBeenCalled();

        expect(result.current.isComplete).toBe(true);
        expect(result.current.isError).toBe(false);
      });

      test('when verify session fails but get user session token from refresh token succeeds', async () => {
        const { result } = await setup({
          storeState: {
            authUserId: 'authUserId',
            authUserSessionToken: 'authUserSessionToken',
            sdkMetaData: {
              webCryptoDpopJwt: 'webCryptoDpopJwt',
              userSessionRefreshToken: 'userSessionRefreshToken',
            },
          },
          rejectVerifyUserSession: true,
        });

        expect(mockedUseVerifyUserSessionResolve).not.toHaveBeenCalled();
        expect(mockedUseVerifyUserSessionReject).toHaveBeenCalled();

        expect(mockedUseUserSessionTokenFromRefreshTokenResolve).toHaveBeenCalled();
        expect(mockedUseUserSessionTokenFromRefreshTokenReject).not.toHaveBeenCalled();

        expect(mockedUseRefreshSessionResolve).not.toHaveBeenCalled();
        expect(mockedUseRefreshSessionReject).not.toHaveBeenCalled();

        expect(result.current.isComplete).toBe(true);
        expect(result.current.isError).toBe(false);
      });
    });
  });
});
