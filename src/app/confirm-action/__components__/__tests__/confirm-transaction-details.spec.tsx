import { ConfirmTransactionDetails } from '@app/confirm-action/__components__/confirm-transaction-details/confirm-transaction-details';
import truncateAddress from '@lib/utils/truncate-address';
import { render, screen } from '@testing-library/react';

jest.mock('@lib/utils/truncate-address', () => jest.fn());

describe('ConfirmTransactionDetails', () => {
  const props = {
    toAddress: '0x1234567890abcdef1234567890abcdef12345678',
    blockExplorer: 'https://test.com',
    networkName: 'Ethereum',
  };

  beforeEach(() => {
    // Set a return value for the mocked truncateAddress function
    (truncateAddress as jest.Mock).mockReturnValue('0x123...5678');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders transaction details correctly', () => {
    render(<ConfirmTransactionDetails {...props} />);

    expect(screen.getByText('Confirm Transaction?')).toBeInTheDocument();
    expect(screen.getByText('Send to')).toBeInTheDocument();
    expect(screen.getByText('Network')).toBeInTheDocument();
    expect(screen.getByText('Network fee')).toBeInTheDocument();
    expect(screen.getByText('Free')).toBeInTheDocument();

    const addressLink = screen.getByRole('link', { name: '0x123...5678' });
    expect(addressLink).toHaveAttribute('href', `${props.blockExplorer}/address/${props.toAddress}`);
  });
});
