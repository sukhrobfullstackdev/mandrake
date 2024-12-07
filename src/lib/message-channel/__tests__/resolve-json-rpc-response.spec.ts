import { RpcErrorCode } from '@constants/json-rpc';
import { BaseAnalyticsProperties } from '@lib/message-channel/event-helper';
import { resolveJsonRpcResponse } from '@lib/message-channel/resolve-json-rpc-response';
import { SDKError } from '@lib/message-channel/sdk-reject';
import { JsonRpcRequestPayload } from '@magic-sdk/types';
import { waitFor } from '@testing-library/react';

describe('@lib/resolve-json-rpc-response', () => {
  const onMessageSpy = jest.fn();

  beforeAll(() => {
    window.addEventListener('message', (evt: MessageEvent) => onMessageSpy(evt.data));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('resolve json rpc should post expected payload no error', async () => {
    const payload = { jsonrpc: '2.0', id: '1' } as JsonRpcRequestPayload;
    const sdkMetadata = { deviceShare: 'device_share', userSessionRefreshToken: 'refresh_token' };
    const result = { testResult: 'test_result' };
    const analyticsProperties = { uid: 'test' } as BaseAnalyticsProperties;

    const configuration = { payload, sdkMetadata, result, analyticsProperties };
    resolveJsonRpcResponse(configuration);

    await waitFor(() => {
      expect(onMessageSpy).toHaveBeenCalledWith({
        msgType: 'MAGIC_HANDLE_RESPONSE',
        response: { error: undefined, id: '1', jsonrpc: '2.0', result: { testResult: 'test_result' } },
        rt: 'refresh_token',
        deviceShare: 'device_share',
      });
    });
  });

  it('resolve json rpc should post expected payload with internal rpc error', async () => {
    const payload = { jsonrpc: '2.0', id: '1' } as JsonRpcRequestPayload;
    const sdkMetadata = { deviceShare: 'device_share', userSessionRefreshToken: 'refresh_token' };
    const error = new SDKError({ code: RpcErrorCode.InternalError as any, message: 'test_error_message' });
    const analyticsProperties = { uid: 'test' } as BaseAnalyticsProperties;

    const configuration = { payload, sdkMetadata, error, analyticsProperties };
    resolveJsonRpcResponse(configuration);

    await waitFor(() => {
      expect(onMessageSpy).toHaveBeenCalledWith({
        msgType: 'MAGIC_HANDLE_RESPONSE',
        response: {
          error: {
            code: RpcErrorCode.InternalError,
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
});
