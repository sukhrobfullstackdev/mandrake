import { useStore } from '@hooks/store';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import MwsLogoutPage from '../page';

const mockedMutate = jest.fn();

jest.mock('@hooks/data/embedded/user', () => ({
  useUserLogoutQuery: jest.fn().mockImplementation(() => ({ mutate: mockedMutate })),
}));

function setup() {
  useStore.setState({
    authUserId: 'X95nor-YoN7cDSew7_lTxJDR_YIn7r1FPFW9m7f6chI=',
  });

  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <MwsLogoutPage />
    </QueryClientProvider>,
  );
}

describe('MWS Logout', () => {
  beforeEach(setup);

  it('should call logout mutation with authUserId', () => {
    expect(mockedMutate).toHaveBeenCalledTimes(1);
  });
});
