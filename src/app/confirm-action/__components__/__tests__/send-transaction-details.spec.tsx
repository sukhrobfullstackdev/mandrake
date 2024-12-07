import { SendTransactionDetails } from '@app/confirm-action/__components__/send-transaction-details/send-transaction-details';
import { ActionStatus } from '@custom-types/confirm-action';
import { ETH_TRANSFER, TOKEN_TRANSFER, TransactionType } from '@hooks/data/embedded/confirm-action';
import { render, screen } from '@testing-library/react';

jest.mock('@app/confirm-action/__components__/sign-message-details/sign-message-details', () => ({
  YouCanSafelyGoBackToApp: jest.fn(({ appName }) => <div>{`Go back to ${appName}`}</div>),
}));

jest.mock('@app/send/rpc/eth/eth_sendTransaction/__components__/send-tx-token-logo', () =>
  jest.fn(() => <div>Token Logo</div>),
);

jest.mock('@app/send/rpc/eth/eth_sendTransaction/__components__/transaction-send-amount', () =>
  jest.fn(({ value }) => <div>{`Amount: ${value}`}</div>),
);

jest.mock('@app/send/rpc/eth/eth_sendTransaction/__components__/transaction-to-from-addresses', () =>
  jest.fn(({ to, from }) => <div>{`From: ${from}, To: ${to}`}</div>),
);

jest.mock('@lib/common/i18n', () => ({
  useTranslation: jest.fn().mockReturnValue({
    t: (key: string, values?: any) => {
      if (values && values.appName) {
        return `Confirm your ${values.appName} transaction`;
      }
      return key;
    },
  }),
}));

describe('SendTransactionDetails', () => {
  const defaultProps = {
    appName: 'TestApp',
    transactionType: ETH_TRANSFER as TransactionType,
    amount: '10',
    currency: 'ETH',
    fiatValue: '100',
    from: '0xSenderAddress',
    to: '0xRecipientAddress',
    actionStatus: ActionStatus.PENDING,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders ETH transfer details correctly', () => {
    render(<SendTransactionDetails {...defaultProps} />);

    expect(screen.getByText('Confirm your TestApp transaction')).toBeInTheDocument();
    expect(screen.getByText('Amount: 100')).toBeInTheDocument();
    expect(screen.getByText('Token Logo')).toBeInTheDocument();
    expect(screen.getByText('10 ETH')).toBeInTheDocument();
    expect(screen.getByText('From: 0xSenderAddress, To: 0xRecipientAddress')).toBeInTheDocument();
  });

  it('renders rejected state correctly', () => {
    render(<SendTransactionDetails {...defaultProps} actionStatus={ActionStatus.REJECTED} />);

    expect(screen.getByText('You rejected the transaction')).toBeInTheDocument();
    expect(screen.getByText('Go back to TestApp')).toBeInTheDocument();
  });

  it('renders approved state correctly', () => {
    render(<SendTransactionDetails {...defaultProps} actionStatus={ActionStatus.APPROVED} />);

    expect(screen.getByText('Your transaction is being sent!')).toBeInTheDocument();
    expect(screen.getByText('Go back to TestApp')).toBeInTheDocument();
  });

  it('renders token transfer details correctly', () => {
    render(
      <SendTransactionDetails {...defaultProps} transactionType={TOKEN_TRANSFER} tokenAmount="50" symbol="USDT" />,
    );

    expect(screen.getByText('Confirm your TestApp transaction')).toBeInTheDocument();
    expect(screen.getByText('Token Logo')).toBeInTheDocument();
    expect(screen.getByText('50 USDT')).toBeInTheDocument();
    expect(screen.getByText('From: 0xSenderAddress, To: 0xRecipientAddress')).toBeInTheDocument();
  });
});
