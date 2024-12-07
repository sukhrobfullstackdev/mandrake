import { CardPayment } from '@app/send/rpc/nft/magic_nft_checkout/__components__/card-payment/card-payment';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

jest.mock('@hooks/data/embedded/nft', () => ({
  useNftCheckoutPayload: () => ({
    nftCheckoutPayload: {
      contractId: '1e719eaa-990e-41cf-b2e0-a4eb3d5d1312',
      tokenId: '2',
      name: 'TEST NFT CHECKOUT',
      imageUrl: 'https://nft-cdn.alchemy.com/matic-mumbai/5d55353a3f95997ce7b33bc08c6832ed',
      quantity: 1,
    },
  }),
  usePaypalClientToken: () => ({
    data: {
      paypalClientId: 'PAYPAL_CLIENT_ID',
      paypalClientToken: 'PAYPAL_CLIENT_TOKEN',
      paypalMerchantId: 'PAYPAL_MERCHANT_ID',
      paypalBnCode: 'PAYPAL_BN_CODE',
    },
  }),
}));

const setup = () => {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <CardPayment />
    </QueryClientProvider>,
  );
};

describe('CardPayment component', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render CardPayment correctly', () => {
    setup();

    expect(screen.getByText('Payment details')).toBeInTheDocument();
  });
});
