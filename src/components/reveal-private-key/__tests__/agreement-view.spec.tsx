import { RevealViewType } from '@components/reveal-private-key/__type__';
import AgreementViewPage from '@components/reveal-private-key/agreement-view';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

const mockReplace = jest.fn();

jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: () => ({
    replace: mockReplace,
  }),
}));

function setup(type: RevealViewType = RevealViewType.REVEAL) {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <AgreementViewPage type={type} />
    </QueryClientProvider>,
  );
}

describe('Agreement view page', () => {
  it('shows a Export private key button when type === EXPORT', () => {
    setup(RevealViewType.EXPORT);

    const closeButton = screen.getByRole('button', { name: /Export private key/i });
    expect(closeButton).toBeInTheDocument();
  });

  it('shows a Reveal private key button when type !== EXPORT', () => {
    setup();

    const closeButton = screen.getByRole('button', { name: /Reveal private key/i });
    expect(closeButton).toBeInTheDocument();
  });
});
