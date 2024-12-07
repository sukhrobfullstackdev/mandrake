import { NftCheckoutProvider } from '@app/send/rpc/nft/magic_nft_checkout/nft-checkout-context';
import { NftCheckoutHome } from '@app/send/rpc/nft/magic_nft_checkout/nft-checkout-home';
import { nftQueryKeys } from '@hooks/data/embedded/nft/keys';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: jest.fn().mockImplementation(() => ({
    replace: jest.fn(),
  })),
}));

jest.mock('@hooks/common/hydrate-session', () => ({
  useHydrateSession: jest
    .fn()
    .mockImplementation(() => ({ isHydrateSessionError: false, isHydrateSessionFetched: true })),
}));

const setup = () => {
  const queryClient = new QueryClient(TEST_CONFIG);

  queryClient.setQueryData(
    nftQueryKeys.getNftTokenInfo({
      contractId: '123',
      tokenId: '123',
    }),
    {
      id: '123',
      contractId: '123',
      contractAddress: '123',
      contractChainId: 123,
      contractType: '123',
      contractCryptoMintFunction: '123',
      tokenId: 123,
      timeCreated: new Date(),
      timeUpdated: new Date(),
      price: 123,
      denomination: '123',
      maxQuantity: 123,
      mintedQuantity: 123,
      usdRate: 123,
    },
  );

  return render(
    <QueryClientProvider client={queryClient}>
      <NftCheckoutProvider>
        <NftCheckoutHome />
      </NftCheckoutProvider>
    </QueryClientProvider>,
  );
};

describe('NftCheckoutHome component', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render header correctly', () => {
    setup();
    expect(screen.getByText('Checkout')).toBeInTheDocument();
  });
});
