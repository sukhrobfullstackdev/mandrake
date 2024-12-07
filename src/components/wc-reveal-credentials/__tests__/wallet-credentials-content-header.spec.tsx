import { CredentialType } from '@app/send/rpc/bespoke/wc_reveal_wallet_credentials/__types__';
import WalletCredentialsContentHeader from '@components/wc-reveal-credentials/wallet-credentials-content-header';

import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

jest.mock('@magiclabs/ui-components', () => {
  const actual = jest.requireActual('@magiclabs/ui-components');
  return {
    ...actual,
    LoadingSpinner: () => <div data-testid="loading-spinner" />,
  };
});

function setup(credentialType: CredentialType) {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <WalletCredentialsContentHeader credentialType={credentialType} />
    </QueryClientProvider>,
  );
}

describe('WC Wallet Credentials Content Header', () => {
  it('header shows correct text for seed phrase', () => {
    setup(CredentialType.SeedPhrase);
    const text = screen.getByText('Recovery Phrase');
    expect(text).toBeInTheDocument();
  });

  it('header shows correct text for private key', () => {
    setup(CredentialType.PrivateKey);
    const text = screen.getByText('Wallet Private Key');
    expect(text).toBeInTheDocument();
  });

  it('body shows correct text for seed phrase', () => {
    setup(CredentialType.SeedPhrase);
    const text = screen.getByText(
      'Please only reveal your {{credentialText}} privately. Store it in a secure place that only you have access.',
    );
    expect(text).toBeInTheDocument();
  });

  it('body shows correct text for private key', () => {
    setup(CredentialType.PrivateKey);
    const text = screen.getByText(
      'Please only reveal your {{credentialText}} privately. Store it in a secure place that only you have access.',
    );
    expect(text).toBeInTheDocument();
  });
});
