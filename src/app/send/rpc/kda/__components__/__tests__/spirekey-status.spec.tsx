import SpireKeyStatus from '@app/send/rpc/kda/__components__/spirekey-status';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

function setup(errorMessage = '', isPending = false) {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <SpireKeyStatus
        isPending={isPending}
        errorMessage={errorMessage}
        defaultText="Login status"
        retryCallback={() => jest.fn()}
      />
    </QueryClientProvider>,
  );
}

describe('SpireKey Status', () => {
  it('renders a message and retry button when there is an error message', () => {
    setup('Error message');
    const retryButton = screen.getByRole('button', { name: /Please try again/i });
    const errorMessage = screen.getByText('Error message');
    expect(retryButton).toBeInTheDocument();
    expect(errorMessage).toBeInTheDocument();
  });

  it('renders default text and no button when there is no error message', () => {
    setup('', true);
    const retryButton = screen.queryByRole('button', { name: /Please try again/i });
    const errorMessage = screen.getByText('Login status');
    expect(retryButton).not.toBeInTheDocument();
    expect(errorMessage).toBeInTheDocument();
  });
});
