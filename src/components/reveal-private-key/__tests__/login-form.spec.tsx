import { LoginProvider } from '@app/send/rpc/user/reveal_page_login/__types__';
import LoginForm from '@components/reveal-private-key/login-form';
import { useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';

jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: () => ({
    replace: jest.fn(),
  }),
}));

jest.mock('@magiclabs/ui-components', () => {
  const actual = jest.requireActual('@magiclabs/ui-components');
  return {
    ...actual,
    TextInput: () => <div data-testid="text-input" />,
    PhoneInput: () => <div data-testid="phone-input" />,
  };
});

jest.mock('@hooks/common/json-rpc-request', () => ({
  useResolveActiveRpcRequest: jest.fn(() => jest.fn()),
}));

function setup(focusedProvider: string) {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <LoginForm focusedProvider={focusedProvider as LoginProvider} />
    </QueryClientProvider>,
  );
}

describe('LoginButton', () => {
  it('renders a text input when focused provider is email', () => {
    setup('link');
    expect(screen.getByTestId('text-input')).toBeInTheDocument();
  });

  it('renders a text input when focused provider is phone', () => {
    setup('sms');
    expect(screen.getByTestId('phone-input')).toBeInTheDocument();
  });

  it('resolves active RPC request when log in button is clicked', () => {
    setup('link');
    const button = screen.getByRole('button', { name: /Log in/i });
    act(() => {
      button.click();
    });
    expect(useResolveActiveRpcRequest as jest.Mock).toHaveBeenCalled();
  });
});
