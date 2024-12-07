import PassportCollectibleDetailsPage from '@app/passport/rpc/wallet/magic_passport_wallet_nfts/collectible_details/page';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';

const mockReplace = jest.fn();

jest.mock('@hooks/common/passport-router', () => ({
  usePassportRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn().mockReturnValue(
    new URLSearchParams({
      contractAddress: '0x123456789',
      networkName: 'Sepolia Testnet',
      tokenId: 'abcdefghijklmnop',
    }),
  ),
}));

jest.mock('@hooks/data/passport/store', () => ({
  usePassportStore: jest.fn().mockReturnValue({
    decodedQueryParams: {
      network: {
        blockExplorers: {
          default: {
            url: 'https://sepolia.etherscan.io',
          },
        },
      },
    },
  }),
}));

function setup() {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <PassportCollectibleDetailsPage />
    </QueryClientProvider>,
  );
}

describe('Magic Passport Collectible Details Page', () => {
  beforeEach(setup);

  it('renders a back button', () => {
    const backButton = screen.getAllByRole('button')[2];
    expect(backButton).toBeInTheDocument();

    act(() => backButton.click());
    expect(mockReplace).toHaveBeenCalledWith('/passport/rpc/wallet/magic_passport_wallet_nfts');
  });
});
