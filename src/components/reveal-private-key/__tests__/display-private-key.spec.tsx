import DisplayPrivateKey from '@components/reveal-private-key/display-private-key';
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

function setup(isLoading: boolean) {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <DisplayPrivateKey isLoading={isLoading} isHidden={false} rawPrivateCredentials="test1234" />
    </QueryClientProvider>,
  );
}

describe('Display Private Key Container', () => {
  it('shows a loading spinner when isLoading is true', () => {
    setup(true);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
  });

  it("doesn't show a loading spinner when isLoading is false", () => {
    setup(false);
    const spinner = screen.queryByTestId('loading-spinner');
    expect(spinner).not.toBeInTheDocument();
  });
});
