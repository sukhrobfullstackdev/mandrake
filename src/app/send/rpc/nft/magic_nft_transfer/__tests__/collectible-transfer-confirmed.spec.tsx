import CollectibleTransferConfirmedPage from '@app/send/rpc/nft/magic_nft_transfer/confirmed/page';
import { render, screen } from '@testing-library/react';

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: jest.fn(),
}));

jest.mock('@constants/nft', () => ({
  NFT_TRANSFER_ROUTES: {
    ERROR: '/nft/transfer/error',
  },
}));

jest.mock('@components/collectible/collectible-transfer-confirm', () => ({
  CollectibleTransferConfirm: jest.fn(({ contractAddress, tokenId, hash, count }) => (
    <div>
      <p>Contract Address: {contractAddress}</p>
      <p>Token ID: {tokenId}</p>
      <p>Hash: {hash}</p>
      <p>Count: {count}</p>
    </div>
  )),
}));

describe('CollectibleTransferConfirmedPage', () => {
  const mockUseSearchParams = jest.requireMock('next/navigation').useSearchParams;
  const mockUseSendRouter = jest.requireMock('@hooks/common/send-router').useSendRouter;
  const mockRouter = { replace: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSendRouter.mockReturnValue(mockRouter);
  });

  it('redirects to the error page if required params are missing', () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams(''));
    render(<CollectibleTransferConfirmedPage />);

    expect(mockRouter.replace).toHaveBeenCalledWith('/nft/transfer/error');
  });

  it('renders the CollectibleTransferConfirm component with valid params', () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('contractAddress=0x123&tokenId=456&count=2&hash=0xabc'));
    render(<CollectibleTransferConfirmedPage />);

    expect(mockRouter.replace).not.toHaveBeenCalled();
    expect(screen.getByText('Contract Address: 0x123')).toBeInTheDocument();
    expect(screen.getByText('Token ID: 456')).toBeInTheDocument();
    expect(screen.getByText('Hash: 0xabc')).toBeInTheDocument();
    expect(screen.getByText('Count: 2')).toBeInTheDocument();
  });

  it('does not render the CollectibleTransferConfirm component if params are missing', () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('contractAddress=0x123&hash=0xabc'));
    render(<CollectibleTransferConfirmedPage />);

    expect(mockRouter.replace).toHaveBeenCalledWith('/nft/transfer/error');
    expect(screen.queryByText('Contract Address:')).not.toBeInTheDocument();
    expect(screen.queryByText('Token ID:')).not.toBeInTheDocument();
    expect(screen.queryByText('Hash:')).not.toBeInTheDocument();
    expect(screen.queryByText('Count:')).not.toBeInTheDocument();
  });
});
