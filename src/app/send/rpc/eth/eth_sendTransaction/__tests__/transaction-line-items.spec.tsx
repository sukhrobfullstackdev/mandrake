import { CurrencyFormatter } from '@app/send/rpc/eth/eth_sendTransaction/__components__/currency-formatter';
import { TokenFormatter } from '@app/send/rpc/eth/eth_sendTransaction/__components__/token-formatter';
import TransactionLineItems from '@app/send/rpc/eth/eth_sendTransaction/__components__/transaction-line-items';
import { render, screen } from '@testing-library/react';

jest.mock('@hooks/common/chain-info', () => ({
  useChainInfo: jest.fn(() => ({
    chainInfo: {
      currency: 'ETH',
    },
  })),
}));

jest.mock('@app/send/rpc/eth/eth_sendTransaction/__components__/token-formatter', () => ({
  TokenFormatter: jest.fn(() => <span>TokenFormatter</span>),
}));

jest.mock('@app/send/rpc/eth/eth_sendTransaction/__components__/currency-formatter', () => ({
  CurrencyFormatter: jest.fn(() => <span>CurrencyFormatter</span>),
}));

describe('TransactionLineItems', () => {
  test('renders Send Amount and Network Fee with values', () => {
    render(
      <TransactionLineItems
        amountWei="50000000000000000"
        amountUsd="100"
        networkFeeWei="1000000000000000"
        networkFeeUsd="2"
        totalUsd="102"
        totalWei="51000000000000000"
      />,
    );

    expect(screen.getByText('Send Amount')).toBeInTheDocument();
    expect(screen.getByText('Network Fee')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  test('renders loading spinner when values are not provided', () => {
    const { container } = render(
      <TransactionLineItems
        amountWei={undefined}
        amountUsd={undefined}
        networkFeeWei={undefined}
        networkFeeUsd={undefined}
        totalUsd={undefined}
        totalWei={undefined}
      />,
    );

    expect(container.getElementsByTagName('circle')).toHaveLength(6); // three <LoadingSpinners>
  });

  test('renders TokenFormatter and CurrencyFormatter with correct values', () => {
    render(
      <TransactionLineItems
        amountWei="50000000000000000"
        amountUsd="100"
        networkFeeWei="1000000000000000"
        networkFeeUsd="2"
        totalUsd="102"
        totalWei="51000000000000000"
      />,
    );

    expect(TokenFormatter).toHaveBeenCalledWith(expect.objectContaining({ value: 0.05, token: 'ETH' }), {});
    expect(TokenFormatter).toHaveBeenCalledWith(expect.objectContaining({ value: 0.001, token: 'ETH' }), {});
    expect(CurrencyFormatter).toHaveBeenCalledWith(expect.objectContaining({ value: 100 }), {});
    expect(CurrencyFormatter).toHaveBeenCalledWith(expect.objectContaining({ value: 2 }), {});
  });

  test('renders ERC20 transfer correctly', () => {
    render(
      <TransactionLineItems
        amountWei="50000000000000000"
        amountUsd="100"
        networkFeeWei="1000000000000000"
        networkFeeUsd="2"
        totalUsd="102"
        totalWei="51000000000000000"
        isErc20Transfer
      />,
    );

    expect(screen.queryByText('Send Amount')).not.toBeInTheDocument();
    expect(screen.getByText('Network Fee')).toBeInTheDocument();
    expect(screen.queryByText('Total')).not.toBeInTheDocument();
  });
});
