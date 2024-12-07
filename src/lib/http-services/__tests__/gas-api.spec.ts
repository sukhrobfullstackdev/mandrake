import { useStore } from '@hooks/store';
import { GasHttpService } from '@lib/http-services/embedded/gas-api';
import { getReferrer } from '@lib/utils/location';
import { getNetworkName } from '@lib/utils/network-name';
import { camelizeKeys } from '@lib/utils/object-helpers';
import { isMobileSdk } from '@lib/utils/platform';

jest.mock('@hooks/store');
jest.mock('@lib/atomic-rpc-payload');
jest.mock('@lib/utils/location');
jest.mock('@lib/utils/network-name');
jest.mock('@lib/utils/object-helpers');
jest.mock('@lib/utils/platform');

const mockedUseStore = jest.mocked(useStore);
const mockedGetReferrer = jest.mocked(getReferrer);
const mockedGetNetworkName = jest.mocked(getNetworkName);
const mockedCamelizeKeys = jest.mocked(camelizeKeys);
const mockedIsMobileSdk = jest.mocked(isMobileSdk);

describe('gasHttpService', () => {
  let gasHttpService: GasHttpService;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    gasHttpService = new GasHttpService();
    mockFetch = jest.fn();
    global.fetch = mockFetch as unknown as typeof fetch;

    mockedUseStore.getState.mockReturnValue({
      authUserSessionToken: 'mockSessionToken',
      customAuthorizationToken: 'mockJwt',
      decodedQueryParams: {
        bundleId: 'mockBundleId',
        domainOrigin: 'mockDomain',
        ethNetwork: 'mockNetwork',
        locale: 'en-US',
        sdkType: 'mockSdk',
        meta: { test: 'data' },
        version: '1.0.0',
        ext: 'mockExt',
      },
    } as any);

    mockedGetReferrer.mockReturnValue('mockReferrer');
    mockedGetNetworkName.mockReturnValue('mockNetworkName');
    mockedIsMobileSdk.mockReturnValue(false);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Get', () => {
    it('should make a GET request and return camelized data', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ some_data: 'test' }),
      };
      mockFetch.mockResolvedValue(mockResponse);
      mockedCamelizeKeys.mockReturnValue({ someData: 'test' });

      const result = await gasHttpService.Get('/test-route');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test-route'),
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result).toEqual({ someData: 'test' });
    });

    it('should throw an error if the response is not ok', async () => {
      mockFetch.mockResolvedValue({ ok: false });

      await expect(gasHttpService.Get('/test-route')).rejects.toThrow('Failed to fetch NFT token info');
    });
  });

  describe('Post', () => {
    it('should make a POST request and return camelized data', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ some_data: 'test' }),
      };
      mockFetch.mockResolvedValue(mockResponse);
      mockedCamelizeKeys.mockReturnValue({ someData: 'test' });

      const result = await gasHttpService.Post('/test-route', {}, { testData: 'value' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test-route'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ testData: 'value' }),
        }),
      );
      expect(result).toEqual({ someData: 'test' });
    });

    it('should throw an error if the response is not ok', async () => {
      mockFetch.mockResolvedValue({ ok: false });

      await expect(gasHttpService.Post('/test-route')).rejects.toThrow('Failed to fetch NFT token info');
    });
  });

  describe('getHeaders', () => {
    it('should return the correct headers', () => {
      const headers = (gasHttpService as any).getHeaders();

      expect(headers).toMatchObject({
        accept: 'application/json, text/plain, */*',
        'content-type': 'application/json;charset=UTF-8',
        'accept-language': 'en-US',
        'x-amzn-trace-id': expect.stringMatching(/Root=.+/),
        'x-fortmatic-network': 'mockNetworkName',
        'x-magic-api-key': expect.any(String),
        'x-magic-bundle-id': 'mockBundleId',
        'x-magic-referrer': 'mockReferrer',
        'x-magic-sdk': 'mockSdk',
        'x-magic-trace-id': expect.any(String),
        'x-magic-meta': expect.any(String),
        authorization: 'Bearer mockSessionToken',
        'x-custom-authorization-token': 'mockJwt',
      });
    });

    it('should not include authorization header if already present', () => {
      const headers = (gasHttpService as any).getHeaders({ Authorization: 'CustomAuth' });

      expect(headers).not.toHaveProperty('authorization');
      expect(headers).toHaveProperty('Authorization', 'CustomAuth');
    });
  });
});
