import { usePassportStore } from '@hooks/data/passport/store';
import { getBasePassportAnalyticsProperties } from '@lib/message-channel/popup/popup-analytics-event-helper';
import { getDecodedQueryParams } from '@lib/utils/query-string';

jest.mock('@lib/atomic-rpc-payload', () => ({
  PopupAtomicRpcPayloadService: {
    getActiveRpcPayload: jest.fn().mockReturnValue({
      method: 'magic_passport_user_connect',
      params: [],
    }),
    handleRequestEvent: jest.fn(),
    enqueuePendingRpcRequest: jest.fn(),
    setActiveRpcPayload: jest.fn(),
    constructRpcPath: jest.fn(),
    startPerformanceTimer: jest.fn(),
    getEventOrigin: jest.fn().mockReturnValue('event.origin.com'),
  },
}));

const setup = (queryParams: string) => {
  const encodedQueryParams = decodeURIComponent(queryParams);

  const decodedQueryParams = getDecodedQueryParams(encodedQueryParams);

  usePassportStore.setState({
    decodedQueryParams,
  });
};

describe('getBasePassportAnalyticsProperties', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('routes to Mandrake api-wallet when method is valid and enabled', () => {
    setup(
      'eyJBUElfS0VZIjoicGtfMDAzQTQ2NzE0QjNBMkI5MCIsInBheWxvYWQiOnsiaWQiOjgsImpzb25ycGMiOiIyLjAiLCJtZXRob2QiOiJtYWdpY19wYXNzcG9ydF91c2VyX2Nvbm5lY3QiLCJwYXJhbXMiOltdfSwibmV0d29yayI6eyJpZCI6MTExNTUxMTEsIm5hbWUiOiJTZXBvbGlhIiwibmF0aXZlQ3VycmVuY3kiOnsibmFtZSI6IlNlcG9saWEgRXRoZXIiLCJzeW1ib2wiOiJFVEgiLCJkZWNpbWFscyI6MTh9LCJycGNVcmxzIjp7ImRlZmF1bHQiOnsiaHR0cCI6WyJodHRwczovL3JwYzIuc2Vwb2xpYS5vcmciXX19LCJibG9ja0V4cGxvcmVycyI6eyJkZWZhdWx0Ijp7Im5hbWUiOiJFdGhlcnNjYW4iLCJ1cmwiOiJodHRwczovL3NlcG9saWEuZXRoZXJzY2FuLmlvIiwiYXBpVXJsIjoiaHR0cHM6Ly9hcGktc2Vwb2xpYS5ldGhlcnNjYW4uaW8vYXBpIn19LCJ0ZXN0bmV0Ijp0cnVlfSwibG9jYWxlIjoiZW5fVVMiLCJzZGtOYW1lIjoibWFnaWMtcGFzc3BvcnQiLCJwbGF0Zm9ybSI6IndlYiJ9',
    );
    const result = getBasePassportAnalyticsProperties();
    expect(result).toEqual({
      api_key: 'pk_003A46714B3A2B90',
      blockchain: 'Sepolia',
      chainId: '11155111',
      env: 'test-testnet',
      eventOrigin: 'event.origin.com',
      json_rpc_method: 'magic_passport_user_connect',
      locale: 'en_US',
      rpcUrl: 'https://rpc2.sepolia.org',
      sdk: 'magic-passport',
      source: 'mandrake-magic',
      uid: null,
      walletType: 'ETH',
    });
  });

  it('routes to Mandrake api-wallet when method is valid and enabled', () => {
    setup(
      'eyJBUElfS0VZIjoicGtfMDAzQTQ2NzE0QjNBMkI5MCIsInBheWxvYWQiOnsiaWQiOjIsImpzb25ycGMiOiIyLjAiLCJtZXRob2QiOiJtYWdpY19wYXNzcG9ydF91c2VyX2Nvbm5lY3QiLCJwYXJhbXMiOltdfSwibmV0d29yayI6eyJpZCI6ODQ1MzIsIm5ldHdvcmsiOiJiYXNlLXNlcG9saWEiLCJuYW1lIjoiQmFzZSBTZXBvbGlhIiwibmF0aXZlQ3VycmVuY3kiOnsibmFtZSI6IlNlcG9saWEgRXRoZXIiLCJzeW1ib2wiOiJFVEgiLCJkZWNpbWFscyI6MTh9LCJycGNVcmxzIjp7ImRlZmF1bHQiOnsiaHR0cCI6WyJodHRwczovL3NlcG9saWEuYmFzZS5vcmciXX19LCJibG9ja0V4cGxvcmVycyI6eyJkZWZhdWx0Ijp7Im5hbWUiOiJCYXNlc2NhbiIsInVybCI6Imh0dHBzOi8vc2Vwb2xpYS5iYXNlc2Nhbi5vcmciLCJhcGlVcmwiOiJodHRwczovL2FwaS1zZXBvbGlhLmJhc2VzY2FuLm9yZy9hcGkifX0sInRlc3RuZXQiOnRydWUsInNvdXJjZUlkIjoxMTE1NTExMX0sImxvY2FsZSI6ImVuX1VTIiwic2RrTmFtZSI6Im1hZ2ljLXBhc3Nwb3J0IiwicGxhdGZvcm0iOiJ3ZWIifQ==',
    );

    const result = getBasePassportAnalyticsProperties();
    expect(result).toEqual({
      api_key: 'pk_003A46714B3A2B90',
      blockchain: 'Base Sepolia',
      chainId: '84532',
      env: 'test-testnet',
      eventOrigin: 'event.origin.com',
      json_rpc_method: 'magic_passport_user_connect',
      locale: 'en_US',
      rpcUrl: 'https://sepolia.base.org',
      sdk: 'magic-passport',
      source: 'mandrake-magic',
      uid: null,
      walletType: 'ETH',
    });
  });
});
