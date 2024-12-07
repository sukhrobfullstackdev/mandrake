import { CredentialType } from '@app/send/rpc/bespoke/wc_reveal_wallet_credentials/__types__';
import DisplayWalletCredentials from '@components/wc-reveal-credentials/display-wallet-credentials';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

function setup() {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <DisplayWalletCredentials credentialType={CredentialType.PrivateKey} />
    </QueryClientProvider>,
  );
}

describe('WC Display Wallet Credentials', () => {
  it('renders a copy button', () => {
    setup();
    const button = screen.getByRole('button', { name: 'Copy credentials to clipboard' });
    expect(button).toBeInTheDocument();
  });

  it('renders a reveal button', () => {
    setup();
    const button = screen.getByRole('button', { name: 'Reveal credentials' });
    expect(button).toBeInTheDocument();
  });
});
