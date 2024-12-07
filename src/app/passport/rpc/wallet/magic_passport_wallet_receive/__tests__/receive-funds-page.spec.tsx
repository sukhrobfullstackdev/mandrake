import PassportReceiveFundsPage from '@app/passport/rpc/wallet/magic_passport_wallet_receive/page';
import { copyToClipboard } from '@lib/utils/copy';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';

const mockReplace = jest.fn();

jest.mock('@hooks/common/passport-router', () => ({
  usePassportRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('@hooks/passport/use-smart-account', () => ({
  useSmartAccount: () => ({
    smartAccount: { address: '0x8ba1f109551bd432803012645ac136ddd64dba72' },
  }),
}));

jest.mock('@lib/utils/copy', () => ({
  copyToClipboard: jest.fn(),
}));

function setup() {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <PassportReceiveFundsPage />
    </QueryClientProvider>,
  );
}

describe('Magic Passport Receive Funds Page', () => {
  beforeEach(setup);

  it('back button navigates to wallet home page', () => {
    const backButton = screen.getAllByRole('button')[0];
    expect(backButton).toBeInTheDocument();

    act(() => backButton.click());
    expect(mockReplace).toHaveBeenCalledWith('/passport/rpc/wallet/magic_passport_wallet');
  });

  it('copy button calls clipboard function when clicked', () => {
    const copyButton = screen.getByText('Copy Address');
    expect(copyButton).toBeInTheDocument();

    act(() => copyButton.click());
    expect(copyToClipboard).toHaveBeenCalledWith('0x8ba1f109551bd432803012645ac136ddd64dba72');
  });

  it('copy button changes text when clicked', () => {
    const copyButton = screen.getByText('Copy Address');
    expect(copyButton).toBeInTheDocument();

    act(() => copyButton.click());
    expect(screen.getByText('Copied')).toBeInTheDocument();
  });

  it('displays a truncated public address', () => {
    const publicAddress = screen.getByText('0x8ba1...ba72');
    expect(publicAddress).toBeInTheDocument();
  });
});
