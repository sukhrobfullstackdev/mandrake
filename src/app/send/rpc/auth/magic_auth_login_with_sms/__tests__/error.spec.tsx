import { render, screen } from '@testing-library/react';

import { StoreState, useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SmsError from '../error/page';

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

const mockState = {
  sdkMetaData: {
    webCryptoDpopJwt: 'jwt',
  },
};

const setup = (state: Partial<StoreState>) => {
  const queryClient = new QueryClient(TEST_CONFIG);
  useStore.setState(state);
  AtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_auth_login_with_sms',
    id: '1',
    params: [{ phoneNumber: '+14326750098' }],
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <SmsError />
    </QueryClientProvider>,
  );
};

describe('SMS Error Component', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the close button', async () => {
    await setup(mockState);

    expect(screen.getByText('Close')).toBeInTheDocument();
  });
});
