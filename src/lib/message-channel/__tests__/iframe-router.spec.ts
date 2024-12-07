// Import necessary libraries and modules
import { LEGACY_RELAYER_DOM_ELEMENT_ID } from '@constants/legacy-relayer';
import { MagicMethodEventData } from '@custom-types/rpc';
import { LDFlagSet } from '@launchdarkly/node-server-sdk';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { IframePayloadRouter } from '@lib/message-channel/iframe/iframe-payload-router';
import { genericEthProxy } from '@message-channel/eth-proxy-for-headless';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import clearAllMocks = jest.clearAllMocks;

// Mock the genericCustomNodeForHeadlessPayload function
jest.mock('@message-channel/eth-proxy-for-headless', () => ({
  genericEthProxy: jest.fn(),
}));

// Mock necessary modules
jest.mock('@lib/atomic-rpc-payload', () => ({
  AtomicRpcPayloadService: {
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
    flags = {
      rpcRouteMagicAuthLoginWithEmailOtpEnabled: true,
      rpcRoutesAuthModuleEnabled: true,
      routeUniversalTrafficToMandrake: false,
      shouldUseEthProxy: false,
      shouldSkipPhantom: false,
    };
    payloadRouter = new IframePayloadRouter(router, flags, false);

    messageData = {
      payload: {
        method: 'test_method',
        params: [{ payloadId: '123' }],
      },
      jwt: 'test_jwt',
    };
  });

  it('routes to Mandrake when method is valid and enabled', () => {
    messageData.payload.method = 'magic_auth_login_with_email_otp';
    payloadRouter = new IframePayloadRouter(router as AppRouterInstance, flags, false);
    payloadRouter.route(messageData);
    expect(AtomicRpcPayloadService.setActiveRpcPayload).toHaveBeenCalledWith({
      method: 'magic_auth_login_with_email_otp',
      params: [{ payloadId: '123' }],
    });
    expect(AtomicRpcPayloadService.constructRpcPath).toHaveBeenCalledWith('test_jwt');
    expect(mockReplace).toHaveBeenCalledWith('test_path');
  });

  it('routes to Eth Proxy when method starts with eth_ or net_, shouldUseEthProxy is true, and method is not ETH_SENDTRANSACTION or ETH_SIGNTRANSACTION', async () => {
    // Mock the response of the genericCustomNodeForHeadlessPayload function
    (genericEthProxy as jest.Mock).mockResolvedValue({
      result: 'test_result',
      error: null,
    });

    messageData.payload.method = 'eth_chainId';
    flags = {
      ...flags,
      shouldUseEthProxy: true,
    };
    payloadRouter = new IframePayloadRouter(router, flags, false);
    await payloadRouter.route(messageData);

    expect(genericEthProxy).toHaveBeenCalledWith(messageData.payload, undefined);
  });

  it('rejects the request when method is not processed and Phantom is skipped', () => {
    messageData.payload.method = 'UNKNOWN_METHOD';
    flags = {
      ...flags,
      shouldSkipPhantom: true,
    };
    payloadRouter = new IframePayloadRouter(router, flags, false);
    payloadRouter.route(messageData);
    expect(AtomicRpcPayloadService.getActiveRpcPayload).toHaveBeenCalled();
  });

  it('routes to Phantom when method is not recognized and shouldSkipPhantom is false', () => {
    // Mock the global document.getElementById method
    document.getElementById = jest.fn().mockReturnValue({
      contentWindow: {
        postMessage: jest.fn(),
      },
    });

    messageData.payload.method = 'UNKNOWN_METHOD';
    flags = {
      ...flags,
      shouldSkipPhantom: false,
    };
    payloadRouter = new IframePayloadRouter(router, flags, false);
    payloadRouter.route(messageData);

    // Assert that postMessage was called with the correct arguments
    expect(document.getElementById).toHaveBeenCalledWith(LEGACY_RELAYER_DOM_ELEMENT_ID);
    expect(
      (document.getElementById(LEGACY_RELAYER_DOM_ELEMENT_ID) as HTMLIFrameElement)?.contentWindow?.postMessage,
    ).toHaveBeenCalledWith(messageData, '*');
  });
});
