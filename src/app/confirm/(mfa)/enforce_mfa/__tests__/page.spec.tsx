import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import EnforceMfaPage from '../page';

// Mock the useRouter hook and the components imported
const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: jest.fn(() => '/confirm/enforce_mfa'),
}));

function setup() {
  AtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_auth_login_with_magic_link',
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

describe('Confirm EnforceMfaPage', () => {
  beforeEach(setup);

  test('renders EnforceMFA component', () => {
    expect(screen.getByText('Please enter the 6-digit code from your authenticator app.')).toBeInTheDocument();
  });

  test('navigates to enforce mfa recovery code on lost device press', () => {
    fireEvent.click(screen.getByText('I lost my device'));
    expect(mockPush).toHaveBeenCalledWith('/confirm/enforce_mfa_recovery_code');
  });
});
