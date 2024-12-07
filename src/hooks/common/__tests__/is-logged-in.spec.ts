import { MagicSdkIncomingWindowMessage } from '@constants/window-messages';
import { useIsLoggedIn } from '@hooks/common/is-logged-in';
import { StoreState, useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { iFramePostMessage } from '@lib/message-channel/iframe/iframe-post-message';

import { renderHook } from '@testing-library/react';

const routerReplaceSpy = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: routerReplaceSpy,
  }),
  usePathname: jest.fn(() => '/send/rpc/auth/magic_is_logged_in'),
}));

jest.mock('@lib/message-channel/iframe/iframe-message-service', () => ({
  IFrameMessageService: {
    hideOverlay: jest.fn(),
  },
}));

jest.mock('@hooks/common/hydrate-session', () => ({
  useHydrateSession: jest.fn().mockImplementation(() => ({
    isError: false,
    isComplete: true,
  })),
}));

jest.mock('@lib/message-channel/iframe/iframe-post-message', () => ({
  iFramePostMessage: jest.fn(),
}));

const mockState = {};

function setup(state: Partial<StoreState>) {
  useStore.setState(state);
  AtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_is_logged_in',
    id: '1',
    params: [],
  });
}

describe('useIsLoggedIn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return true when hydrate session completes without errors', () => {
    setup(mockState);
    renderHook(() => useIsLoggedIn());

    expect(iFramePostMessage).toHaveBeenCalledWith(
      MagicSdkIncomingWindowMessage.MAGIC_HANDLE_RESPONSE,
      { error: undefined, id: '1', jsonrpc: '2.0', result: true },
      undefined,
      undefined,
    );
    expect(IFrameMessageService.hideOverlay).toHaveBeenCalledWith();
    expect(routerReplaceSpy).toHaveBeenCalledWith('/send/idle');
  });

  it('should return true when there is an authUserId and authUserSessionToken', () => {
    setup({ ...mockState, authUserId: '12345', authUserSessionToken: '12345' });
    renderHook(() => useIsLoggedIn());

    expect(iFramePostMessage).toHaveBeenCalledWith(
      MagicSdkIncomingWindowMessage.MAGIC_HANDLE_RESPONSE,
      { error: undefined, id: '1', jsonrpc: '2.0', result: true },
      undefined,
      undefined,
    );
    expect(IFrameMessageService.hideOverlay).toHaveBeenCalledWith();
    expect(routerReplaceSpy).toHaveBeenCalledWith('/send/idle');
  });
});
