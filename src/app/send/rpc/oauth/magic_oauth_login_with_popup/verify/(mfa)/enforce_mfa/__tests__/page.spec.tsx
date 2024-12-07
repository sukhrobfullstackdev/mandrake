import { RPC_VERIFY_ROUTE } from '@app/send/rpc/oauth/magic_oauth_login_with_popup/constants';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import EnforceMfaPage from '../page';

// Mock the useRouter hook and the components imported
const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: jest.fn(() => '/send/rpc/oauth/magic_oauth_login_with_popup/verify/enforce_mfa'),
}));

function setup() {
  AtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_oauth_login_with_popup',
    id: 'my_id',
    params: [{ provider: 'google' }],
  });

  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <div>MockEnforceMFA</div>
      <EnforceMfaPage />
    </QueryClientProvider>,
  );
}

describe('OAuth EnforceMfaPage', () => {
  beforeEach(setup);

  test('renders EnforceMFA component', () => {
    expect(screen.getByText('Please enter the 6-digit code from your authenticator app.')).toBeInTheDocument();
  });

  test('navigates to enforce mfa recovery code on lost device press', () => {
    fireEvent.click(screen.getByText('I lost my device'));
    expect(mockReplace).toHaveBeenCalledWith(`${RPC_VERIFY_ROUTE}/enforce_mfa_recovery_code`);
  });
});
