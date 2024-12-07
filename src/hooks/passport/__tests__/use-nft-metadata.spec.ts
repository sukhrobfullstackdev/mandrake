import { formatDataField } from '@app/passport/libs/format_data_field';
import { NFT_PASSPORT_NO_IMAGE_URL } from '@constants/nft';
import { useNFTMetadata } from '@hooks/passport/use-nft-metadata';
import { getCollectionName } from '@lib/passport-utils/get-collection-name';
import { extractTokenURI } from '@lib/utils/decode-token-uri';
import { ipfsToHttp } from '@lib/utils/ipfs-to-http';
import { act, renderHook } from '@testing-library/react';
import { CallUnencoded, Network } from 'magic-passport/types';

jest.mock('@app/passport/libs/format_data_field');
jest.mock('@lib/utils/decode-token-uri');
jest.mock('@lib/utils/ipfs-to-http');
jest.mock('@lib/passport-utils/get-collection-name');

describe('useNFTMetadata', () => {
  const mockNetwork = { id: 1, name: 'Sepolia' } as Network;
  const mockCalls: CallUnencoded[] = [
    {
      abi: [
        {
          inputs: [],
          name: 'mint',
          outputs: [{ type: 'uint256' }],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ],
      functionName: 'mint',
      args: [],
      to: '0x1234567890123456789012345678901234567890',
      value: BigInt(0),
    },
  ] as CallUnencoded[];

  beforeEach(() => {
    jest.clearAllMocks();
    (formatDataField as jest.Mock).mockReturnValue('0xformattedData');
    (extractTokenURI as jest.Mock).mockReturnValue('ipfs://tokenURI');
    (ipfsToHttp as jest.Mock).mockImplementation(uri => `https://${uri.replace('ipfs://', '')}`);
    (getCollectionName as jest.Mock).mockResolvedValue('Mock Collection');
    global.fetch = jest.fn();
  });

  it('should initialize with fallback values and loading state if calls is null', () => {
    const { result } = renderHook(() => useNFTMetadata({ calls: null, network: mockNetwork }));

    expect(result.current).toEqual({
      nftName: '',
      nftImage: NFT_PASSPORT_NO_IMAGE_URL,
      isLoading: false,
    });
  });

  it('should handle successful tokenURI metadata fetch with both name and image', async () => {
    const mockMetadata = {
      name: 'Cool NFT',
      image: 'ipfs://image123',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockMetadata),
    });

    const { result } = renderHook(() => useNFTMetadata({ calls: mockCalls, network: mockNetwork }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current).toEqual({
      nftName: 'Cool NFT',
      nftImage: 'https://image123',
      isLoading: false,
    });
  });

  it('should handle tokenURI metadata with only name', async () => {
    const mockMetadata = {
      name: 'Cool NFT',
      image: '',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockMetadata),
    });

    const { result } = renderHook(() => useNFTMetadata({ calls: mockCalls, network: mockNetwork }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current).toEqual({
      nftName: 'Cool NFT',
      nftImage: NFT_PASSPORT_NO_IMAGE_URL,
      isLoading: false,
    });
  });

  it('should handle tokenURI metadata with only image', async () => {
    const mockMetadata = {
      name: '',
      image: 'ipfs://image123',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockMetadata),
    });

    const { result } = renderHook(() => useNFTMetadata({ calls: mockCalls, network: mockNetwork }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current).toEqual({
      nftName: 'Mock Collection',
      nftImage: 'https://image123',
      isLoading: false,
    });
  });

  it('should fallback to collection name when tokenURI fetch fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

    const { result } = renderHook(() => useNFTMetadata({ calls: mockCalls, network: mockNetwork }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current).toEqual({
      nftName: 'Mock Collection',
      nftImage: NFT_PASSPORT_NO_IMAGE_URL,
      isLoading: false,
    });
  });

  it('should set fallbacks when tokenURI is not found', async () => {
    (extractTokenURI as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() => useNFTMetadata({ calls: mockCalls, network: mockNetwork }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current).toEqual({
      nftName: 'Mock Collection',
      nftImage: NFT_PASSPORT_NO_IMAGE_URL,
      isLoading: false,
    });
  });

  it('should use default values when both tokenURI and collection name fail', async () => {
    (extractTokenURI as jest.Mock).mockReturnValue(null);
    (getCollectionName as jest.Mock).mockRejectedValue(new Error('Failed to get collection name'));

    const { result } = renderHook(() => useNFTMetadata({ calls: mockCalls, network: mockNetwork }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current).toEqual({
      nftName: 'Untitled NFT',
      nftImage: NFT_PASSPORT_NO_IMAGE_URL,
      isLoading: false,
    });
  });

  it('should handle non-OK response from tokenURI fetch', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    const { result } = renderHook(() => useNFTMetadata({ calls: mockCalls, network: mockNetwork }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current).toEqual({
      nftName: 'Mock Collection',
      nftImage: NFT_PASSPORT_NO_IMAGE_URL,
      isLoading: false,
    });
  });
});
