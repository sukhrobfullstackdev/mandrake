import RecencyCheck from '@components/recency-check/recency-check';
import { useStore } from '@hooks/store';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';

const mockReplace = jest.fn();
const mockOnSuccess = jest.fn();
const mockOnClosePress = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: jest.fn(() => '/send/rpc/user/update_phone_number/recency_check'),
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
      <RecencyCheck onSuccess={mockOnSuccess} onClosePress={mockOnClosePress} />
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

  it('calls onClosePress when close is pressed', async () => {
    const button = screen.getByLabelText('close');
    act(() => button.click());

    await waitFor(() => {
      expect(mockOnClosePress).toHaveBeenCalled();
    });
  });
});
