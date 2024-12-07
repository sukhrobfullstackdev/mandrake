import { getQueryClient } from '@common/query-client';
import { ClientConfig } from '@custom-types/magic-client';
import { WalletInfo } from '@custom-types/wallet';
import { magicClientQueryKeys } from '@hooks/data/embedded/magic-client';
import { StoreState, useStore } from '@hooks/store';
import { CreateDIDTokenOptions, DEFAULT_TOKEN_LIFESPAN } from '@lib/decentralized-id/create-did-token';
import { DkmsService } from '@lib/dkms';
import { mockClientConfig } from '@mocks/client-config';
import { mockUser1 } from '@mocks/user';
import { mockWalletInfo1 } from '@mocks/wallet';
import { QueryClientProvider } from '@tanstack/react-query';
import { RenderHookResult, act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import {
  UseCreateDidTokenForUserParams,
  UseCreateDidTokenForUserReturn,
  useCreateDidTokenForUser,
} from '../create-did-token-for-user';

const MOCK_PRIVATE_KEY = '0x1234567890abcdef';
const MOCK_DID_TOKEN = 'did:ethr:0x1234567890abcdef';
const MOCK_AUTH_USER_ID = 'mock_auth_user_id';
const MOCK_AUTH_USER_SESSION_TOKEN = '123abc';

const mockCreateDidToken = jest.fn().mockReturnValue(Promise.resolve(MOCK_DID_TOKEN));

jest.mock('@hooks/common/hydrate-or-create-wallets/hydrate-or-create-eth-wallet');
jest.mock('@hooks/common/hydrate-or-create-wallets/wallet-info-and-credentials');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));
jest.mock('@lib/dkms');

jest.mock('@hooks/common/launch-darkly', () => ({
  useFlags: jest.fn().mockReturnValue({}),
}));
jest.mock('@lib/decentralized-id/create-did-token', () => ({
  createDIDToken: (options: CreateDIDTokenOptions) => mockCreateDidToken(options),
}));

jest.mock('@hooks/data/embedded/wallet', () => ({
  getWalletInfoQuery: jest.fn(),
  walletQueryKeys: {
    info: jest.fn(),
  },
}));

jest.mock('@aws-sdk/client-cognito-identity', () => ({
  CognitoIdentityClient: jest.fn(),
  GetIdCommand: jest.fn(),
  GetCredentialsForIdentityCommand: jest.fn(),
}));

const API_KEY = 'my-api-key';

type SetupParams = {
  enabled?: boolean;
  storeState?: Partial<StoreState>;
  clientConfig?: ClientConfig | null;
  walletInfo?: WalletInfo | null;
  hasKmsError?: boolean;
};

type SetupReturn = RenderHookResult<UseCreateDidTokenForUserReturn, UseCreateDidTokenForUserParams>;

const queryClient = getQueryClient();

const setup = async ({
  enabled = true,
  storeState = {
    authUserId: MOCK_AUTH_USER_ID,
    authUserSessionToken: MOCK_AUTH_USER_SESSION_TOKEN,
    magicApiKey: API_KEY,
  },
  clientConfig = mockClientConfig,
  hasKmsError = false,
}: SetupParams = {}): Promise<SetupReturn> => {
  if (storeState) {
    useStore.setState({ ...storeState });
  }

  const { magicApiKey } = useStore.getState();

  if (magicApiKey) {
    queryClient.setQueryData(
      magicClientQueryKeys.config({
        magicApiKey: API_KEY,
      }),
      clientConfig,
    );
  }

  if (hasKmsError) {
    (DkmsService.reconstructSecretWithUserSession as jest.Mock).mockRejectedValue(new Error());
  } else {
    (DkmsService.reconstructSecretWithUserSession as jest.Mock).mockResolvedValue({
      privateKey: MOCK_PRIVATE_KEY,
      walletInfoData: mockWalletInfo1,
    });
  }

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  let hook: SetupReturn | unknown;

  await act(async () => {
    hook = await renderHook(() => useCreateDidTokenForUser({ enabled }), { wrapper });
  });

  return hook as SetupReturn;
};

describe('@hooks/common/create-did-token-for-user', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  it('createDIDToken is called with correct parameters', async () => {
    const { result } = await setup();

    (DkmsService.reconstructSecretWithUserSession as jest.Mock).mockResolvedValue({
      privateKey: MOCK_PRIVATE_KEY,
      walletInfoData: mockWalletInfo1,
    });
    expect(mockCreateDidToken).toHaveBeenCalledWith<[CreateDIDTokenOptions]>({
      account: {
        privateKey: MOCK_PRIVATE_KEY,
        address: mockUser1.publicAddress,
      },
      audience: mockClientConfig.clientId,
      subject: MOCK_AUTH_USER_ID,
      lifespan: DEFAULT_TOKEN_LIFESPAN,
      attachment: undefined,
      systemClockOffset: 0,
    });
    expect(result.current.didToken).toBe(MOCK_DID_TOKEN);
    expect(result.current.error).toBeNull();
  });

  it('if not enabled, then no token returned', async () => {
    const { result } = await setup({
      enabled: false,
    });

    expect(result.current.didToken).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('if there is no auth user id and no UST, then no token returned', async () => {
    const { result } = await setup({
      storeState: {
        authUserId: null,
        authUserSessionToken: null,
      },
    });

    expect(result.current.didToken).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('if there is no client config, then no token is returned', async () => {
    const { result } = await setup({
      clientConfig: null,
    });

    expect(result.current.didToken).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('if not enabled, then createDIDToken is not called', async () => {
    await setup({ enabled: false });
    expect(mockCreateDidToken).not.toHaveBeenCalled();
  });

  it('returns error if kms decrypt fails', async () => {
    const { result } = await setup({ hasKmsError: true });
    expect(result.current.didToken).toBeNull();
    expect(result.current.error).toBe('Error Fetching data needed for DID Token');
  });
});
