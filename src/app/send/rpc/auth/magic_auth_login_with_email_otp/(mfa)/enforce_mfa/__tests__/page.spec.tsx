import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import EnforceMfaPage from '../page';

// Mock the useRouter hook and the components imported
const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: jest.fn(() => '/send/rpc/auth/magic_auth_login_with_email_otp/enforce_mfa'),
}));

function setup() {
  AtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_auth_login_with_email_otp',
    id: 'my_id',
    params: [{ email: 'test@mgail.com' }],
  });

  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <div>MockEnforceMFA</div>
      <EnforceMfaPage />
    </QueryClientProvider>,
  );
}

describe('EnforceMfaPage', () => {
  beforeEach(setup);

  test('renders EnforceMFA component', () => {
    expect(screen.getByText('Please enter the 6-digit code from your authenticator app.')).toBeInTheDocument();
  });

  test('navigates to enforce mfa recovery code on lost device press', () => {
    fireEvent.click(screen.getByText('I lost my device'));
    expect(mockReplace).toHaveBeenCalledWith(
      '/send/rpc/auth/magic_auth_login_with_email_otp/enforce_mfa_recovery_code',
    );
  });
});
