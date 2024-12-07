import { LoginArg, LoginProvider } from '@components/reveal-private-key/__type__';
import LoginButton from '@components/reveal-private-key/login-button';
import { useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';

jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: () => ({
    replace: jest.fn(),
  }),
}));

jest.mock('@hooks/common/json-rpc-request', () => ({
  useResolveActiveRpcRequest: jest.fn(() => jest.fn()),
}));

function setup(loginType: string, loginArg: string) {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <LoginButton
        loginType={loginType as LoginProvider}
        loginArg={loginArg as LoginArg}
        setFocusedProvider={() => {}}
      />
    </QueryClientProvider>,
  );
}

describe('LoginButton', () => {
  it('renders an email button when passed email arg', () => {
    setup('link', 'email');
    expect(screen.getByRole('button', { name: /Email/i })).toBeInTheDocument();
  });

  it('renders a phone button when passed phone arg', () => {
    setup('sms', 'phone');
    expect(screen.getByRole('button', { name: /Phone/i })).toBeInTheDocument();
  });

  it('resolves active RPC request when social button is clicked', () => {
    setup('oauth2', 'google');
    const button = screen.getByRole('button', { name: /Google/i });
    act(() => {
      button.click();
    });
    expect(useResolveActiveRpcRequest as jest.Mock).toHaveBeenCalled();
  });
});
