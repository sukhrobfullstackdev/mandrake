import { MagicMethodEventData } from '@custom-types/rpc';
import { LDFlagSet } from '@launchdarkly/node-server-sdk';
import { PopupAtomicRpcPayloadService } from '@lib/atomic-rpc-payload';

import { PopupPayloadRouter } from '@lib/message-channel/popup/popup-payload-router';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import clearAllMocks = jest.clearAllMocks;

// Mock necessary modules
jest.mock('@lib/atomic-rpc-payload', () => ({
  PopupAtomicRpcPayloadService: {
    getActiveRpcPayload: jest.fn(),
    handleRequestEvent: jest.fn(),
    enqueuePendingRpcRequest: jest.fn(),
    setActiveRpcPayload: jest.fn(),
    constructRpcPath: jest.fn().mockReturnValue('test_path'),
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

describe('PopupPayloadRouter', () => {
  let router: AppRouterInstance;
  let payloadRouter;
  let flags: LDFlagSet;
  let messageData: MagicMethodEventData;

  beforeEach(() => {
    clearAllMocks();
    router = { replace: mockReplace } as unknown as AppRouterInstance;
    flags = {
      rpcRouteMagicPassportUserConnectEnabled: true,
    };
    payloadRouter = new PopupPayloadRouter(router);

    messageData = {
      payload: {
        method: 'test_method',
        params: [{ payloadId: '123' }],
      },
      jwt: 'test_jwt',
    };
  });

  it('routes to Mandrake when method is valid and enabled', () => {
    messageData.payload.method = 'magic_passport_user_connect';
    payloadRouter = new PopupPayloadRouter(router);
    payloadRouter.route(messageData);
    expect(PopupAtomicRpcPayloadService.setActiveRpcPayload).toHaveBeenCalledWith({
      method: 'magic_passport_user_connect',
      params: [{ payloadId: '123' }],
    });
    expect(PopupAtomicRpcPayloadService.constructRpcPath).toHaveBeenCalledWith();
    expect(mockReplace).toHaveBeenCalledWith('test_path');
  });

  it('rejects the request when method is not processed and Phantom is skipped', () => {
    messageData.payload.method = 'UNKNOWN_METHOD';
    flags = {
      ...flags,
      shouldSkipPhantom: true,
    };
    payloadRouter = new PopupPayloadRouter(router);
    payloadRouter.route(messageData);
    expect(PopupAtomicRpcPayloadService.getActiveRpcPayload).toHaveBeenCalled();
  });
});
