import AgreementPage from '@app/api-wallets/rpc/user/magic_export_key/agreement_view/page';
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
      <AgreementPage />
    </QueryClientProvider>,
  );
}

describe('Agreement view page', () => {
  it('shows a Export private key', () => {
    setup();

    const closeButton = screen.getByRole('button', { name: /Export private key/i });
    expect(closeButton).toBeInTheDocument();
  });
});
