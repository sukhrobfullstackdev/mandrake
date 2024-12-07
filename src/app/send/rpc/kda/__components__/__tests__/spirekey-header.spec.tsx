import SpireKeyHeader from '@app/send/rpc/kda/__components__/spirekey-header';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: () => ({
    replace: jest.fn(),
  }),
}));

function setup(showCloseButton = true) {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <SpireKeyHeader showCloseButton={showCloseButton} />
    </QueryClientProvider>,
  );
}

describe('SpireKey Header', () => {
  it('renders a close button when true', () => {
    setup();
    const closeButton = screen.getByRole('button');
    expect(closeButton).toBeInTheDocument();
  });

  it("doesn't render a close button when false", () => {
    setup(false);
    const closeButton = screen.queryByRole('button');
    expect(closeButton).not.toBeInTheDocument();
  });
});
