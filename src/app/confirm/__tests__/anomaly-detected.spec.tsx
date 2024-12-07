import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import EmailLinkConfirmAnomalyDetected from '@app/confirm/anomaly_detected/page';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const setup = () => {
  AtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_auth_login_with_magic_link',
    id: '1',
    params: [{ email: 'test@email.com' }],
  });

  const queryClient = new QueryClient(TEST_CONFIG);
  return render(
    <QueryClientProvider client={queryClient}>
      <EmailLinkConfirmAnomalyDetected />
    </QueryClientProvider>,
  );
};

describe('Login With Email Link Anomaly Detected Component', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to /Anomaly Detected route when anomaly is detected', () => {
    setup();
    const linkExpired = screen.getByText('Is this you?');
    expect(linkExpired).toBeInTheDocument();
  });
});
