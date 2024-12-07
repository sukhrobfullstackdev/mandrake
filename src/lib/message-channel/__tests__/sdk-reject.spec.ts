import { sdkReject } from '@lib/message-channel/sdk-reject';
import { JsonRpcRequestPayload } from '@magic-sdk/types';
import { waitFor } from '@testing-library/react';
import { useStore } from '@hooks/store';

describe('@lib/sdk-reject', () => {
  const onMessageSpy = jest.fn();

  beforeAll(() => {
    window.addEventListener('message', (evt: MessageEvent) => onMessageSpy(evt.data));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('sdk reject a single json rpc request should post a message with a successfully rejected error', async () => {
    const payload = { jsonrpc: '2.0', id: '1' } as JsonRpcRequestPayload;
    useStore.setState({ sdkMetaData: { deviceShare: 'device_share', userSessionRefreshToken: 'refresh_token' } });

    const errorCode = 'test_error_code';
    const errorMessage = 'test_error_message';

    sdkReject(payload, errorCode, errorMessage);

    await waitFor(() => {
      expect(onMessageSpy).toHaveBeenCalledWith({
        msgType: 'MAGIC_HANDLE_RESPONSE',
        response: {
          error: {
            code: 'test_error_code',
            data: undefined,
            message: 'test_error_message',
          },
          id: '1',
          jsonrpc: '2.0',
          result: undefined,
        },
        rt: 'refresh_token',
        deviceShare: 'device_share',
      });
    });
  });

  it('sdk reject json rpc request array should post messages with successfully rejected errors', async () => {
    const payload = [
      { jsonrpc: '2.0', id: '1' },
      { jsonrpc: '2.0', id: '2' },
    ] as JsonRpcRequestPayload[];

    useStore.setState({ sdkMetaData: { deviceShare: 'device_share', userSessionRefreshToken: 'refresh_token' } });
    const errorCode = 'test_error_code';
    const errorMessage = 'test_error_message';

    sdkReject(payload, errorCode, errorMessage);

    await waitFor(() => {
      expect(onMessageSpy).toHaveBeenCalledWith({
        msgType: 'MAGIC_HANDLE_RESPONSE',
        response: {
          error: {
            code: 'test_error_code',
            data: undefined,
            message: 'test_error_message',
          },
          id: '1',
          jsonrpc: '2.0',
          result: undefined,
        },
        rt: 'refresh_token',
        deviceShare: 'device_share',
      });
      expect(onMessageSpy).toHaveBeenCalledWith({
        msgType: 'MAGIC_HANDLE_RESPONSE',
        response: {
          error: {
            code: 'test_error_code',
            data: undefined,
            message: 'test_error_message',
          },
          id: '2',
          jsonrpc: '2.0',
          result: undefined,
        },
        rt: 'refresh_token',
        deviceShare: 'device_share',
      });
      expect(onMessageSpy).toHaveBeenCalledTimes(2);
    });
  });
});
