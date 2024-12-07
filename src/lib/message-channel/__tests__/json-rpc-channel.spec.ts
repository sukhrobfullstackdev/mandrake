import { MagicSdkIncomingWindowMessage } from '@constants/window-messages';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { iFramePostMessage } from '@lib/message-channel/iframe/iframe-post-message';
import { resolveMessageType } from '@lib/message-channel/json-rpc-channel';
import { mockDecodedParams1 } from '@mocks/query-params';

describe('resolveMessageType', () => {
  it('should return the original msgType if supportsCustomNode returns false', () => {
    const msgType = MagicSdkIncomingWindowMessage.MAGIC_HANDLE_RESPONSE;
    const result = resolveMessageType(msgType);
    expect(result).toBe(`${msgType}`);
  });

  it('should return the original msgType if sdk is missing', () => {
    useStore.setState({
      decodedQueryParams: {
        ...mockDecodedParams1,
        sdkType: undefined,
      },
    });
    const msgType = MagicSdkIncomingWindowMessage.MAGIC_HANDLE_RESPONSE;
    const result = resolveMessageType(msgType);
    expect(result).toBe(msgType);
  });

  it('should append encodedQueryParams to the msgType if supportsCustomNode returns true and sdk is present', () => {
    const msgType = MagicSdkIncomingWindowMessage.MAGIC_HANDLE_RESPONSE;
    useStore.setState({
      decodedQueryParams: mockDecodedParams1,
    });
    const result = resolveMessageType(msgType);
    expect(result).toBe(`${msgType}-${AtomicRpcPayloadService.getEncodedQueryParams()}`);
  });
});

describe('post', () => {
  const originalPostMessage = window.parent.postMessage;
  const mockPostMessage = jest.fn();

  beforeAll(() => {
    window.parent.postMessage = mockPostMessage;
  });

  afterAll(() => {
    window.parent.postMessage = originalPostMessage;
  });

  beforeEach(() => {
    mockPostMessage.mockClear();
  });

  it('calls postMessage with the correct parameters', () => {
    const msgType = MagicSdkIncomingWindowMessage.MAGIC_HANDLE_RESPONSE;
    const response = { jsonrpc: '2.0', result: 'ok', id: '123' };
    const rt = 'some_rt';
    const deviceShare = 'some_device_share';

    iFramePostMessage(msgType, response, rt, deviceShare);

    expect(mockPostMessage).toHaveBeenCalledWith(
      {
        msgType,
        response,
        rt,
        deviceShare,
      },
      '*',
    );
  });
});
