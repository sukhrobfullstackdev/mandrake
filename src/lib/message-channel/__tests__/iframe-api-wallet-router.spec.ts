// Import necessary libraries and modules
import { MagicMethodEventData } from '@custom-types/rpc';
import { LDFlagSet } from '@launchdarkly/node-server-sdk';
import { ApiWalletAtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { IframePayloadRouter } from '@lib/message-channel/iframe-api-wallets/iframe-payload-router';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import clearAllMocks = jest.clearAllMocks;

// Mock necessary modules
jest.mock('@lib/atomic-rpc-payload', () => ({
  ApiWalletAtomicRpcPayloadService: {
    getActiveRpcPayload: jest.fn(),
    handleRequestEvent: jest.fn(),
    enqueuePendingRpcRequest: jest.fn(),
    setActiveRpcPayload: jest.fn(),
    constructRpcPath: jest.fn().mockReturnValue('test_path'),
    startPerformanceTimer: jest.fn(),
  },
}));

jest.mock('@hooks/store', () => ({
  useStore: {
    getState: jest.fn().mockReturnValue({
      sdkMetaData: { deviceShare: 'device_share', userSessionRefreshToken: 'refresh_token' },
      decodedQueryParams: 'decoded_query_params',
    }),
    setState: jest.fn(),
  },
}));

jest.mock('@message-channel/sdk-reject', () => ({
  sdkReject: jest.fn(),
}));

const mockReplace = jest.fn();

describe('IframePayloadRouter', () => {
  let router: AppRouterInstance;
  let payloadRouter;
  let flags: LDFlagSet;
  let messageData: MagicMethodEventData;

  beforeEach(() => {
    clearAllMocks();
    router = { replace: mockReplace } as unknown as AppRouterInstance;
    payloadRouter = new IframePayloadRouter(router, flags, false);

    messageData = {
      payload: {
        method: 'test_method',
        params: [{ payloadId: '123' }],
      },
      jwt: 'test_jwt',
    };
  });

  it('routes to Mandrake api-wallet when method is valid and enabled', () => {
    messageData.payload.method = 'magic_export_key';
    payloadRouter = new IframePayloadRouter(router as AppRouterInstance, flags, false);
    payloadRouter.route(messageData);
    expect(ApiWalletAtomicRpcPayloadService.setActiveRpcPayload).toHaveBeenCalledWith({
      method: 'magic_export_key',
      params: [{ payloadId: '123' }],
    });
    expect(ApiWalletAtomicRpcPayloadService.constructRpcPath).toHaveBeenCalledWith('test_jwt');
    expect(mockReplace).toHaveBeenCalledWith('test_path');
  });
});
