import PayPalOrderSteps from '@components/show-ui/fiat-on-ramps/paypal/order-steps';
import { PaypalOrderStatus } from '@custom-types/onramp';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

jest.mock('@magiclabs/ui-components', () => {
  const actual = jest.requireActual('@magiclabs/ui-components');
  return {
    ...actual,
    IcoCheckmarkCircleFill: () => <div data-testid="ico-checkmark-circle-fill" />,
    LoadingSpinner: () => <div data-testid="loading-spinner" />,
  };
});

function setup(step: PaypalOrderStatus.PENDING | PaypalOrderStatus.COMPLETED) {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <PayPalOrderSteps step={step} />
    </QueryClientProvider>,
  );
}

describe('PayPal Order Steps', () => {
  it('renders a loading spinner when status is PENDING', () => {
    setup(PaypalOrderStatus.PENDING);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    const checkmarkIcons = screen.getAllByTestId('ico-checkmark-circle-fill');
    expect(checkmarkIcons).toHaveLength(1);
  });

  it('render a checkmark icon when status is COMPLETED', () => {
    setup(PaypalOrderStatus.COMPLETED);
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    const checkmarkIcons = screen.getAllByTestId('ico-checkmark-circle-fill');
    expect(checkmarkIcons).toHaveLength(2);
  });
});
