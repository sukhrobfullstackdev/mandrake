import WalletCredentialsList from '@components/wc-reveal-credentials/wallet-credentials-list';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

function setup(rawWalletCredentials: string) {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <WalletCredentialsList rawWalletCredentials={rawWalletCredentials} />
    </QueryClientProvider>,
  );
}

describe('WC Wallet Credentials List', () => {
  it('shows a single string with no list items for a private key', () => {
    setup('4f3edf983ac63c12b8e423f3ac4f72aa6f70f5376e3dd11c6d5e9e0b1a5d48b8');
    const text = screen.getByText('4f3edf983ac63c12b8e423f3ac4f72aa6f70f5376e3dd11c6d5e9e0b1a5d48b8');
    expect(text).toBeInTheDocument();

    const listItems = screen.queryAllByRole('listitem');
    expect(listItems).toHaveLength(0);
  });

  it('shows a list of string for a seed phrase', () => {
    setup('candy maple cake sugar');
    const listItem1 = screen.getByText('candy');
    const listItem2 = screen.getByText('maple');
    const listItem3 = screen.getByText('cake');
    const listItem4 = screen.getByText('sugar');
    expect(listItem1).toBeInTheDocument();
    expect(listItem2).toBeInTheDocument();
    expect(listItem3).toBeInTheDocument();
    expect(listItem4).toBeInTheDocument();

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(4);
  });
});
