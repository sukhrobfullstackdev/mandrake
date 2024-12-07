import {
  CopyCredentialsButton,
  ShowCredentialsButton,
} from '@components/wc-reveal-credentials/wallet-credentials-buttons';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

function setup(mockBoolean: boolean) {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <>
        <CopyCredentialsButton wasCopied={mockBoolean} onPress={() => {}} />
        <ShowCredentialsButton isHidden={mockBoolean} onPress={() => {}} />
      </>
    </QueryClientProvider>,
  );
}

describe('WC Wallet Credentials Buttons', () => {
  it('copy button shows "Copy" text when wasCopied is false', () => {
    setup(false);
    const content = screen.getByText('Copy');
    expect(content).toBeInTheDocument();
  });

  it('copy button shows "Copied" text when wasCopied is true', () => {
    setup(true);
    const content = screen.getByText('Copied');
    expect(content).toBeInTheDocument();
  });

  it('reveal button shows "Hide" text when isHidden is false', () => {
    setup(false);
    const content = screen.getByText('Hide');
    expect(content).toBeInTheDocument();
  });

  it('reveal button shows "Reveal" text when isHidden is true', () => {
    setup(true);
    const content = screen.getByText('Reveal');
    expect(content).toBeInTheDocument();
  });
});
