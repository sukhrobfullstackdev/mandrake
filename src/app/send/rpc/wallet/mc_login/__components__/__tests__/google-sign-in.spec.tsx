import GoogleSignInPage from '@app/send/rpc/wallet/mc_login/__components__/google-sign-in';
import { useStore } from '@hooks/store';
import { render, screen, waitFor } from '@testing-library/react';

jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@hooks/data/embedded/magic-client', () => ({
  useClientConfigQuery: () => ({
    data: {
      clientTheme: {
        themeColor: 'dark',
      },
    },
  }),
}));

const mockInitialize = jest.fn();
const mockRenderButton = jest.fn();
(global as any).google = {
  accounts: {
    id: {
      initialize: mockInitialize,
      renderButton: mockRenderButton,
    },
  },
};

const setup = () => {
  useStore.setState({ magicApiKey: 'api-key' });
  global.ResizeObserver = class ResizeObserver {
    observe() {}

    disconnect() {}

    unobserve() {}
  };
};

describe('GoogleSignInPage', () => {
  beforeEach(() => {
    mockInitialize.mockClear();
    mockRenderButton.mockClear();
  });

  it('renders google div', () => {
    setup();
    render(<GoogleSignInPage />);
    expect(screen.getByLabelText('googleContainer')).toBeInTheDocument();
  });

  it('loads the Google script and initializes the Google SignIn', async () => {
    render(<GoogleSignInPage />);
    await waitFor(() => expect(mockInitialize).toHaveBeenCalled());
  });

  it('correctly handles theme based on the client config', async () => {
    render(<GoogleSignInPage />);
    await waitFor(() =>
      expect(mockRenderButton).toHaveBeenCalledWith(expect.anything(), {
        theme: 'filled_black',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        width: expect.any(Number),
      }),
    );
  });
});
