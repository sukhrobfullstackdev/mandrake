import UpdatedPhoneNumberDone from '@app/send/rpc/user/update_phone_number/done/page';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

function setup() {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <UpdatedPhoneNumberDone />
    </QueryClientProvider>,
  );
}

describe('UpdatePhoneNumberDone', () => {
  setup();
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to magic_auth_settings when Close button is clicked', async () => {
    const button = screen.getByText('Close');
    act(() => button.click());

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/send/rpc/user/magic_auth_settings');
    });
  });
});
