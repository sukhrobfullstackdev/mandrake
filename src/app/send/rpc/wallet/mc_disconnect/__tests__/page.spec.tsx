import DisconnectPage from '@app/send/rpc/wallet/mc_disconnect/page';
import { useStore } from '@hooks/store';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render } from '@testing-library/react';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const mockedMutate = jest.fn();

jest.mock('@hooks/data/embedded/user', () => ({
  useUserLogoutQuery: jest.fn().mockImplementation(() => ({ mutate: mockedMutate })),
}));

jest.mock('@hooks/common/hydrate-session', () => ({
  useHydrateSession: jest.fn().mockImplementation(() => ({ isError: false, isComplete: true })),
}));

function setup() {
  useStore.setState({
    authUserId: 'X95nor-YoN7cDSew7_lTxJDR_YIn7r1FPFW9m7f6chI=',
    authUserSessionToken:
      '0366867af3614bec581ff1b104d8eb1f3b25a32b4f30bfd3fbf2f486d2e13cf7.iXl38TfF8mpfR3jXTO7TP92-3QE',
  });

  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <DisconnectPage />
    </QueryClientProvider>,
  );
}

describe('Disconnect Page', () => {
  beforeEach(() => {
    act(() => {
      setup();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call logout mutation with authUserId', () => {
    expect(mockedMutate).toHaveBeenCalledTimes(1);
  });
});
