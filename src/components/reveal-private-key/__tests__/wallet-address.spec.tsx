import MonoWalletAddress from '@components/reveal-private-key/wallet-address';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

const mockUseUserMetadata = jest.fn();

jest.mock('@hooks/common/user-metadata', () => ({
  useUserMetadata: () => mockUseUserMetadata(),
}));

mockUseUserMetadata.mockImplementation(() => ({
  userMetadata: {
    publicAddress: '0xAC209574729dDc856001E57c3B1Fb96ef64A782C',
  },
}));

function setup() {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <MonoWalletAddress />
    </QueryClientProvider>,
  );
}

describe('MonoWalletAddress', () => {
  beforeEach(() => {
    setup();
  });

  it('renders a public address', () => {
    expect(screen.getByText('0xAC209574729dDc856001E57c3B1Fb96ef64A782C')).toBeInTheDocument();
  });
});
