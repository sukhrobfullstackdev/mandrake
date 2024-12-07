import { PaymentFailed } from '@app/send/rpc/nft/magic_nft_checkout/__components__/payment-failed/payment-failed';
import { NftCheckoutProvider } from '@app/send/rpc/nft/magic_nft_checkout/nft-checkout-context';
import { render, screen } from '@testing-library/react';

const setStatus = jest.fn();

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn().mockReturnValue(
    new URLSearchParams({
      hash: '0x1234567890',
    }),
  ),
}));

jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: () => ({
    replace: jest.fn(),
  }),
}));

jest.mock('@hooks/data/embedded/nft', () => ({
  useNftCheckoutContext: jest.fn().mockReturnValue({
    setStatus: () => setStatus(),
  }),
  useNftCheckoutPayload: () => ({
    nftCheckoutPayload: {
      contractId: '1e719eaa-990e-41cf-b2e0-a4eb3d5d1312',
      tokenId: '2',
      name: 'TEST NFT CHECKOUT',
      imageUrl: 'https://nft-cdn.alchemy.com/matic-mumbai/5d55353a3f95997ce7b33bc08c6832ed',
      quantity: 1,
    },
  }),
}));

const setup = () => {
  return render(
    <NftCheckoutProvider>
      <PaymentFailed />
    </NftCheckoutProvider>,
  );
};

describe('PaymentFailed component', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render PaymentFailed correctly', () => {
    setup();

    expect(screen.getByText('Payment failed')).toBeInTheDocument();
  });
});
