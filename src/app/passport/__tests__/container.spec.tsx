import Container from '@app/passport/container';
import { DecodedQueryParams } from '@hooks/store';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

function setup(decodedQueryParams: DecodedQueryParams, encodedQueryParams: string) {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <Container decodedQueryParams={decodedQueryParams} encodedQueryParams={encodedQueryParams}>
        <div data-testid="im-a-div"></div>
      </Container>
    </QueryClientProvider>,
  );
}

describe('Passport Container', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the passport container', async () => {
    await act(async () => {
      await setup(
        {
          apiKey: 'pk_003A46714B3A2B90',
          network: {
            id: 11155111,
            name: 'Sepolia',
            nativeCurrency: {
              name: 'Sepolia Ether',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: {
              default: {
                http: ['https://rpc2.sepolia.org'],
              },
            },
            blockExplorers: {
              default: {
                name: 'Etherscan',
                url: 'https://sepolia.etherscan.io',
                apiUrl: 'https://api-sepolia.etherscan.io/api',
              },
            },
            testnet: true,
          },
          locale: 'en_US',
        },
        'eyJBUElfS0VZIjoicGtfMDAzQTQ2NzE0QjNBMkI5MCIsInBheWxvYWQiOnsiaWQiOjIsImpzb25ycGMiOiIyLjAiLCJtZXRob2QiOiJtYWdpY19wYXNzcG9ydF91c2VyX2Nvbm5lY3QiLCJwYXJhbXMiOltdfSwibmV0d29yayI6eyJpZCI6MTExNTUxMTEsIm5hbWUiOiJTZXBvbGlhIiwibmF0aXZlQ3VycmVuY3kiOnsibmFtZSI6IlNlcG9saWEgRXRoZXIiLCJzeW1ib2wiOiJFVEgiLCJkZWNpbWFscyI6MTh9LCJycGNVcmxzIjp7ImRlZmF1bHQiOnsiaHR0cCI6WyJodHRwczovL3JwYzIuc2Vwb2xpYS5vcmciXX19LCJibG9ja0V4cGxvcmVycyI6eyJkZWZhdWx0Ijp7Im5hbWUiOiJFdGhlcnNjYW4iLCJ1cmwiOiJodHRwczovL3NlcG9saWEuZXRoZXJzY2FuLmlvIiwiYXBpVXJsIjoiaHR0cHM6Ly9hcGktc2Vwb2xpYS5ldGhlcnNjYW4uaW8vYXBpIn19LCJ0ZXN0bmV0Ijp0cnVlfSwibG9jYWxlIjoiZW5fVVMiLCJzZGtOYW1lIjoibWFnaWMtcGFzc3BvcnQiLCJwbGF0Zm9ybSI6IndlYiJ9',
      );
    });
    const content = screen.getByTestId('im-a-div');
    expect(content).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
