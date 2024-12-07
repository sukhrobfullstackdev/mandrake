import CollectionDetails from '@app/passport/rpc/wallet/magic_passport_wallet_nfts/collectible_details/components/collection-details';
import { mockAlchemyNfts } from '@mocks/nfts';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';

const mockReplace = jest.fn();

jest.mock('@hooks/common/passport-router', () => ({
  usePassportRouter: () => ({
    replace: mockReplace,
  }),
}));

const { collectionName, description, imageUrl } = mockAlchemyNfts.ownedNfts[0].contract.openSeaMetadata;

function setup() {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <CollectionDetails name={collectionName!} description={description!} collectionLogoSrc={imageUrl!} />
    </QueryClientProvider>,
  );
}

describe('Magic Passport Collection Details', () => {
  beforeEach(setup);

  it('renders a collection name', () => {
    const name = screen.getByText('Magic | NFT.NYC 2023');
    expect(name).toBeInTheDocument();
  });

  it('renders a truncated collection description', () => {
    const queryText =
      'Magic is a secure, scalable developer SDK offering a one-stop solution for web3 authentication, key management, NFT services, and more.';
    const collectionDescription = screen.getByText(`${queryText.slice(0, 120)}...`);
    expect(collectionDescription).toBeInTheDocument();
  });

  it('renders the full description after read more button is clicked', () => {
    const button = screen.getByText('Read more');
    act(() => button.click());
    const queryText =
      'Magic is a secure, scalable developer SDK offering a one-stop solution for web3 authentication, key management, NFT services, and more.';
    const collectionDescription = screen.getByText(queryText);
    expect(collectionDescription).toBeInTheDocument();
  });
});
