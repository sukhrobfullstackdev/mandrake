import RevealWalletCredentials from '@app/send/rpc/bespoke/wc_reveal_wallet_credentials/page';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';

const mockReplace = jest.fn();

jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: () => ({
    replace: mockReplace,
  }),
}));

function setup({ activePayload }: any) {
  AtomicRpcPayloadService.setActiveRpcPayload(activePayload);

  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <RevealWalletCredentials />
    </QueryClientProvider>,
  );
}

describe('WC Reveal Wallet Credentials', () => {
  it('renders a close button', async () => {
    await act(async () => {
      await setup({
        activePayload: {
          jsonrpc: '2.0',
          method: 'magic_auth_login_with_email_otp',
          id: 'my_id',
          params: [{ email: 'goat@magic.link' }],
        },
      });
    });

    const button = screen.getByRole('button', { name: 'close' });
    expect(button).toBeInTheDocument();
  });
});
