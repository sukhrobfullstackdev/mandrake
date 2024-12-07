import { OAuthProvider } from '@app/send/rpc/oauth/magic_oauth_login_with_popup/context';
import PopupPage from '@app/send/rpc/oauth/magic_oauth_login_with_popup/popup/page';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

const mockRejectActiveRpcRequest = jest.fn();
const mockReplace = jest.fn();
const mockPrefetch = jest.fn();

jest.mock('@hooks/common/json-rpc-request', () => ({
  useRejectActiveRpcRequest: jest.fn().mockImplementation(() => mockRejectActiveRpcRequest),
  useResolveActiveRpcRequest: jest.fn().mockImplementation(() => jest.fn()),
}));

jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: jest.fn().mockImplementation(() => ({
    replace: mockReplace,
    prefetch: mockPrefetch,
  })),
}));

const setup = () => {
  AtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_oauth_login_with_popup',
    id: 'my_id',
    params: [
      {
        magicApiKey: 'pk_live_67890fghij',
        platform: 'web',
      },
    ],
  });
  useStore.setState({
    sdkMetaData: {
      webCryptoDpopJwt: '12345',
    },
  });

  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <OAuthProvider>
        <PopupPage />
      </OAuthProvider>
    </QueryClientProvider>,
  );
};

describe('Open popup page', () => {
  it('should reject request if no provider URI', () => {
    setup();
    expect(mockRejectActiveRpcRequest).toHaveBeenCalled();
  });
});
