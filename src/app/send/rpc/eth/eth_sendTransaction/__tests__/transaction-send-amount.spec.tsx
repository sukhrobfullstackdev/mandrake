import { CurrencyFormatter } from '@app/send/rpc/eth/eth_sendTransaction/__components__/currency-formatter';
import { TokenFormatter } from '@app/send/rpc/eth/eth_sendTransaction/__components__/token-formatter';
import TransactionSendAmount, {
  TransactionProps,
} from '@app/send/rpc/eth/eth_sendTransaction/__components__/transaction-send-amount';
import { render } from '@testing-library/react';

jest.mock('@app/send/rpc/eth/eth_sendTransaction/__components__/token-formatter', () => ({
  TokenFormatter: jest.fn(() => <span>TokenFormatter</span>),
}));

jest.mock('@app/send/rpc/eth/eth_sendTransaction/__components__/currency-formatter', () => ({
  CurrencyFormatter: jest.fn(() => <span>CurrencyFormatter</span>),
}));

function setup({ type, value, amount, symbol }: TransactionProps) {
  return render(<TransactionSendAmount type={type} value={value} amount={amount} symbol={symbol} />);
}

describe('TransactionSendAmount', () => {
  test('renders currency formatter for eth-transfer', () => {
    setup({ type: 'eth-transfer', value: 0.05 });
    expect(CurrencyFormatter).toHaveBeenCalledWith(expect.objectContaining({ value: 0.05 }), {});
  });

  test('renders loading spinner for eth-transfer', () => {
    const { container } = setup({ type: 'eth-transfer' });
    expect(container.getElementsByTagName('circle')).toHaveLength(2); // 1 <LoadingSpinners>
  });

  test('renders token formatter for erc20-transfer', () => {
    setup({ type: 'erc20-transfer', amount: '0.05', symbol: 'LINK' });
    expect(TokenFormatter).toHaveBeenCalledWith(expect.objectContaining({ value: 0.05, token: 'LINK' }), {});
  });

  test('renders loading spinner for erc20-transfer', () => {
    const { container } = setup({ type: 'erc20-transfer' });
    expect(container.getElementsByTagName('circle')).toHaveLength(2); // 1 <LoadingSpinners>
  });
});
