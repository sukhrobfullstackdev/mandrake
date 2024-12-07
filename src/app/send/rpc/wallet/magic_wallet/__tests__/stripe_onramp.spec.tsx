import WalletFiatOnrampStripe from '@app/send/rpc/wallet/magic_wallet/stripe_onramp/page';
import { MagicApiErrorCode } from '@constants/error';
import { useStripeClientToken } from '@hooks/data/embedded/onramp';
import { ApiResponseError } from '@lib/http-services/core/api-response-error';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

const mockReplace = jest.fn();

jest.mock('@hooks/data/embedded/onramp', () => ({
  useStripeClientToken: jest.fn().mockReturnValue({
    data: {
      clientSecret: 'test',
    },
  }),
}));

jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('@hooks/common/chain-info', () => ({
  useChainInfo: jest.fn(() => ({
    chainInfo: {
      currency: 'ETH',
      name: 'Ethereum',
    },
  })),
}));

jest.mock('@hooks/data/embedded/magic-client', () => ({
  useClientConfigQuery: () => ({
    data: {
      clientTheme: {
        themeColor: 'dark',
      },
      features: { isFiatOnrampEnabled: true, isSendTransactionUiEnabled: true },
    },
  }),
}));

function setup() {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <WalletFiatOnrampStripe />
    </QueryClientProvider>,
  );
}

describe('WalletFiatOnrampStripe', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    window.open = jest.fn();
  });

  it('redirects to Link by Stripe when clientSecret is defined', () => {
    (useStripeClientToken as jest.Mock).mockImplementation(() => ({
      mutate: jest.fn(),
      isPending: false,
      data: {
        clientSecret: 'test',
      },
      reset: jest.fn(),
      isSuccess: true,
    }));
    setup();
    expect(window.open).toHaveBeenCalled();
  });

  it('shows FiatOnrampError when there is an error', async () => {
    (useStripeClientToken as jest.Mock).mockImplementation(() => ({
      isPending: false,
      error: new ApiResponseError({
        error_code: MagicApiErrorCode.FIAT_ON_RAMP_UNSUPPORTED_LOCATION,
        data: {
          message: '',
        },
        message: '',
        status: 'failed',
        headers: { test: 'test' },
      }),
      reset: jest.fn(),
      isSuccess: false,
    }));
    setup();
    expect(
      await screen.findByText(
        'Link by Stripe is not yet available in your location. Please try again with another payment method.',
      ),
    ).toBeDefined();
  });
});
