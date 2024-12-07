import { useStore } from '@hooks/store';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import EnterTotp from '../page';

const mockReplace = jest.fn();
const mockRejectActiveRpcRequest = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: jest.fn(() => '/send/rpc/user/update_phone_number/recency_check'),
}));
jest.mock('@hooks/common/json-rpc-request', () => ({
  useRejectActiveRpcRequest: () => mockRejectActiveRpcRequest,
}));
jest.mock('@hooks/data/embedded/magic-client', () => ({
  useClientConfigQuery: jest.fn().mockReturnValue({ clientTheme: { appName: 'Your App' } }),
}));

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useEffect: jest.fn,
}));

function setup() {
  useStore.setState({
    email: 'test@email.com',
  });

  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <EnterTotp />
    </QueryClientProvider>,
  );
}

describe('EnterTotp', () => {
  beforeEach(() => {
    act(() => {
      setup();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('closes modal and rejects active rpc request on close press', async () => {
    const button = screen.getByLabelText('close');
    act(() => button.click());

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(`/send/rpc/user/magic_auth_settings`);
    });
  });
});
