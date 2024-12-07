import ConnectWithUILogin from '@app/send/rpc/wallet/mc_login/connect-with-ui-login';
import { magicClientQueryKeys } from '@hooks/data/embedded/magic-client';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const setup = () => {
  const queryClient = new QueryClient(TEST_CONFIG);

  queryClient.setQueryData(magicClientQueryKeys.oauthApp({ provider: 'google' }), [
    {
      id: '123',
      appId: '123',
      redirectId: '123',
    },
  ]);

  return render(
    <QueryClientProvider client={queryClient}>
      <ConnectWithUILogin />
    </QueryClientProvider>,
  );
};

describe('ConnectWithUILogin component', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render header correctly', () => {
    setup();
    expect(screen.getByText('Login / Sign up')).toBeInTheDocument();
  });
});
