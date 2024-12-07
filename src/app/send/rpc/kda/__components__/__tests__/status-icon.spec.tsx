import StatusIcon from '@app/send/rpc/kda/__components__/status-icon';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

jest.mock('@magiclabs/ui-components', () => {
  const actual = jest.requireActual('@magiclabs/ui-components');
  return {
    ...actual,
    IcoDismissCircleFill: () => <svg data-testid="icon-dismiss" />,
    IcoCheckmarkCircleFill: () => <svg data-testid="icon-checkmark" />,
    LoadingSpinner: () => <svg data-testid="loading-spinner" />,
  };
});

function setup(isPending = false, isConfirming = false, isError = false) {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <StatusIcon isPending={isPending} isConfirming={isConfirming} isError={isError} />
    </QueryClientProvider>,
  );
}

describe('Status Icon', () => {
  it('shows a checkmark when all props are false', () => {
    setup();
    expect(screen.getByTestId('icon-checkmark')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-dismiss')).not.toBeInTheDocument();
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });

  it('shows a loading spinner when pending', () => {
    setup(true);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-dismiss')).not.toBeInTheDocument();
    expect(screen.queryByTestId('icon-checkmark')).not.toBeInTheDocument();
  });

  it('shows a loading spinner when confirming', () => {
    setup(false, true);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-dismiss')).not.toBeInTheDocument();
    expect(screen.queryByTestId('icon-checkmark')).not.toBeInTheDocument();
  });

  it('shows an error icon when there is an error', () => {
    setup(false, false, true);
    expect(screen.getByTestId('icon-dismiss')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-checkmark')).not.toBeInTheDocument();
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });
});
