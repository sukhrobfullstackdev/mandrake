import AgreementView from '@app/send/rpc/user/magic_reveal_key/agreement_view/page';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

const mockReplace = jest.fn();

jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: () => ({
    replace: mockReplace,
  }),
}));

function setup() {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <AgreementView />
    </QueryClientProvider>,
  );
}

describe('Agreement view page', () => {
  it('shows a Reveal private key button when type !== EXPORT', () => {
    setup();

    const closeButton = screen.getByRole('button', { name: /Reveal private key/i });
    expect(closeButton).toBeInTheDocument();
  });
});
