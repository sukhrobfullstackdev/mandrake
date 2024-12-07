import NFTAttributes from '@app/passport/rpc/wallet/magic_passport_wallet_nfts/collectible_details/components/nft-attributes';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

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
      <NFTAttributes
        contractAddress="0x123456789"
        networkName="Sepolia Testnet"
        ownedTimestamp="2023-01-01T00:00:00Z"
        attributes={[{ traitType: 'foo', value: 'bar' }]}
        quantity={3}
      />
    </QueryClientProvider>,
  );
}

describe('Magic Passport NFT Attributes', () => {
  beforeEach(setup);

  it('renders the attribute rows', () => {
    const quantityRow = screen.getByText('Quantity');
    const attributesRow = screen.getByText('Properties');
    const ownedSinceRow = screen.getByText('Owned since');
    const blockchainRow = screen.getByText('Blockchain');
    const contractRow = screen.getByText('Contract');
    expect(quantityRow).toBeInTheDocument();
    expect(attributesRow).toBeInTheDocument();
    expect(ownedSinceRow).toBeInTheDocument();
    expect(blockchainRow).toBeInTheDocument();
    expect(contractRow).toBeInTheDocument();
  });
});
