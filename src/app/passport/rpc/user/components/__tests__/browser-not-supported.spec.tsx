import BrowserNotSupported from '@app/passport/rpc/user/components/browser-not-supported';
import { PopupAtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

function setup() {
  PopupAtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_passport_user_connect',
    id: '1',
    params: [],
  });

  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserNotSupported />
    </QueryClientProvider>,
  );
}

describe('Passport Browser Not Supported', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders the browser not supported', () => {
    setup();

    const notSupported = screen.getAllByText('Browser not supported')?.[0];
    expect(notSupported).toBeInTheDocument();
  });
});
