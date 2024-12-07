import { useLoginContext } from '@app/send/login-context';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render } from '@testing-library/react';
import Page from '../page';

const mockRouterReplace = jest.fn();

// Mocking the useRouter and useStore hooks
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockRouterReplace,
  }),
}));

jest.mock('@app/send/login-context', () => ({
  useLoginContext: jest.fn(),
}));

jest.mock('@hooks/common/auth-state', () => ({
  useResetAuthState: jest.fn().mockImplementation(() => ({
    resetAuthState: jest.fn().mockResolvedValue(null),
  })),
}));

jest.mock('cookies-next', () => ({
  getCookie: jest
    .fn()
    .mockReturnValueOnce('j:' + JSON.stringify({ magic_api_key: 'pk_12345' }))
    .mockReturnValueOnce('loginFlowContext')
    .mockReturnValueOnce('mfaFactors')
    .mockReturnValueOnce('j:' + JSON.stringify({ magic_api_key: 'pk_12345' }))
    .mockReturnValueOnce('loginFlowContext')
    .mockReturnValueOnce('mfaFactors')
    .mockReturnValueOnce('j:' + JSON.stringify({ magic_api_key: 'pk_12345' }))
    .mockReturnValueOnce('loginFlowContext')
    .mockReturnValue(undefined),
}));

const setup = () => {
  const queryClient = new QueryClient(TEST_CONFIG);
  return render(
    <QueryClientProvider client={queryClient}>
      <Page />
    </QueryClientProvider>,
  );
};

describe('Oauth V1 credential create Page', () => {
  const mockSetLoginState = jest.fn();

  beforeEach(() => {
    (useLoginContext as jest.Mock).mockReturnValue({
      setLoginState: mockSetLoginState,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('routes to enforce_mfa page if mfaEnabled is true', async () => {
    await act(async () => {
      await setup();
    });
    expect(mockRouterReplace).toHaveBeenCalledWith('/v1/oauth2/credential/create/enforce_mfa');
  });

  it('routes to resolve page if mfaEnabled is false', async () => {
    await act(async () => {
      await setup();
    });
    expect(mockRouterReplace).toHaveBeenCalledWith('/v1/oauth2/credential/create/resolve');
  });
});
