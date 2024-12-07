import { getRpcProvider } from '@lib/common/rpc-provider';
import { HttpService } from '@lib/http-services';
import {
  FORWARDER_ABI,
  MUMBAI_FORWARDER_CONTRACT_ADDRESS,
  POLYGON_FORWARDER_CONTRACT_ADDRESS,
  buildForwardPayload,
} from '@lib/utils/gasless-transactions';

jest.mock('@lib/http-services');
jest.mock('@lib/common/rpc-provider');
jest.mock('ethers', () => ({
  Contract: jest.fn(() => {
    return {
      address: POLYGON_FORWARDER_CONTRACT_ADDRESS,
      getNonce: jest.fn().mockResolvedValue(5),
    };
  }),
}));

describe('Forwarder Module', () => {
  const mockAddress = '0x1234567890123456789012345678901234567890';
  const mockTransaction = {
    to: '0x0987654321098765432109876543210987654321',
    data: '0xabcdef',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Constants', () => {
    test('MUMBAI_FORWARDER_CONTRACT_ADDRESS is correct', () => {
      expect(MUMBAI_FORWARDER_CONTRACT_ADDRESS).toBe('0xB7B46474aAA2729e07EEC90596cdD9772b29Ecfb');
    });

    test('POLYGON_FORWARDER_CONTRACT_ADDRESS is correct', () => {
      expect(POLYGON_FORWARDER_CONTRACT_ADDRESS).toBe('0xC077831B87CB5c335982f54b670eF8F0A04c71c6');
    });

    test('FORWARDER_ABI is an array', () => {
      expect(Array.isArray(FORWARDER_ABI)).toBe(true);
    });
  });

  describe('buildForwardPayload', () => {
    const mockProvider = {
      getNetwork: jest.fn().mockResolvedValue({ chainId: 137 }),
    };

    beforeEach(() => {
      (getRpcProvider as jest.Mock).mockReturnValue(mockProvider);
      (HttpService.Gas.Get as jest.Mock).mockResolvedValue({ nonceAddition: 2 });
    });

    test('builds forward payload correctly for Polygon', async () => {
      const result = await buildForwardPayload(mockAddress, mockTransaction as any);

      expect(result).toEqual({
        types: expect.any(Object),
        primaryType: 'ForwardRequest',
        domain: {
          name: 'MagicForwarderV5',
          version: '1',
          verifyingContract: POLYGON_FORWARDER_CONTRACT_ADDRESS,
          chainId: 137,
        },
        message: {
          from: mockAddress,
          to: mockTransaction.to,
          value: 0,
          gas: 1e6,
          nonce: 7,
          data: mockTransaction.data,
        },
      });
    });

    test('throws error for unsupported chain', async () => {
      mockProvider.getNetwork.mockResolvedValueOnce({ chainId: 1 });

      await expect(buildForwardPayload(mockAddress, mockTransaction as any)).rejects.toThrow(
        'Unsupported gas subsidy chain 1',
      );
    });

    test('throws error for invalid transaction', async () => {
      await expect(buildForwardPayload(mockAddress, {} as any)).rejects.toThrow('Invalid transaction');
    });
  });
});
