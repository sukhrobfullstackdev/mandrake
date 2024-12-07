import StatusHeader from '@app/send/rpc/kda/__components__/status-header';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

function setup(isPending = false, isConfirming = false, errorMessage = '') {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <StatusHeader isPending={isPending} isConfirming={isConfirming} errorMessage={errorMessage} />
    </QueryClientProvider>,
  );
}

describe('Status Header', () => {
  it('renders connected text when all props are false', () => {
    setup();
    const connectedText = screen.getByText('Connected');
    expect(connectedText).toBeInTheDocument();
  });

  it('renders error text when error message is present', () => {
    setup(false, false, 'Error message');
    const errorText = screen.getByText('Something went wrong');
    expect(errorText).toBeInTheDocument();
  });

  it('renders confirmation text when confirming', () => {
    setup(false, true);
    const confirmingText = screen.getByText('Confirming login...');
    expect(confirmingText).toBeInTheDocument();
  });

  it('renders pending text when pending', () => {
    setup(true);
    const pendingText = screen.getByText('Continue in SpireKey');
    expect(pendingText).toBeInTheDocument();
  });
});
