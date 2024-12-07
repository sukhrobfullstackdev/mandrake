import EmailLoginPage from '@app/send/rpc/wallet/mc_login/__components__/email-login';
import { RpcErrorMessage } from '@constants/json-rpc';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

const mockReplace = jest.fn();

jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: jest.fn().mockImplementation(() => ({
    replace: mockReplace,
  })),
}));

jest.mock('@hooks/store', () => ({
  useStore: { getState: jest.fn(() => ({ isGlobalAppScope: true })) },
}));

function setup() {
  return render(<EmailLoginPage />);
}

describe('connectWithUI Email Login', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders input and submit button', () => {
    setup();
    const emailInput = screen.getByLabelText('email input');
    const submitButton = screen.getByLabelText('login-submit-button');
    expect(emailInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  it('enables the login button when an email is typed', () => {
    setup();
    const input = screen.getByPlaceholderText('Email address');
    act(() => {
      fireEvent.change(input, { target: { value: 'test@example.com' } });
    });
    expect(screen.getByText('Login / Sign up')).not.toBeDisabled();
  });

  it('shows an error message when invalid email is submitted', () => {
    setup();
    const input = screen.getByPlaceholderText('Email address');
    act(() => {
      fireEvent.change(input, { target: { value: 'invalidEmail' } });
    });
    act(() => {
      fireEvent.click(screen.getByText('Login / Sign up'));
    });
    waitFor(() => expect(screen.getByText(RpcErrorMessage.MalformedEmail)).toBeInTheDocument());
  });

  it('routes to `magic_auth_login_with_email_otp` with email param', () => {
    const { getByPlaceholderText, getByText } = setup();
    const input = getByPlaceholderText('Email address');
    act(() => {
      fireEvent.change(input, { target: { value: 'test@example.com' } });
    });
    act(() => {
      fireEvent.click(getByText('Login / Sign up'));
    });
    waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith(
        '/send/rpc/auth/magic_auth_login_with_email_otp?email=test%40example.com',
      ),
    );
  });
});
