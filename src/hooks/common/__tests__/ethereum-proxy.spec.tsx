import { useEthereumProxy } from '@hooks/common/ethereum-proxy';
import { useCustomNodeEthProxyQuery, useMagicApiEthProxyQuery } from '@hooks/data/embedded/ethereum-proxy';
import { useStore } from '@hooks/store';
import { getCustomNodeNetworkUrl, getNetworkName, isCustomNode } from '@lib/utils/network-name';
import { act, renderHook } from '@testing-library/react';
import { Transaction, getBigInt } from 'ethers';

// Mock necessary hooks
jest.mock('@hooks/data/embedded/ethereum-proxy', () => ({
  useCustomNodeEthProxyQuery: jest.fn().mockImplementation(() => ({
    mutateAsync: jest.fn(),
  })),
  useMagicApiEthProxyQuery: jest.fn().mockImplementation(() => ({
    mutateAsync: jest.fn(),
  })),
}));

// Mock utility functions
jest.mock('@lib/utils/network-name', () => ({
  getNetworkName: jest.fn(),
  isCustomNode: jest.fn(),
  getCustomNodeNetworkUrl: jest.fn(),
  getETHNetworkUrl: jest.fn(),
}));

jest.mock('@lib/utils/platform', () => ({
  isMobileSdk: jest.fn(),
}));

jest.mock('@lib/pick-randomly', () => ({
  pickRandomly: jest.fn(),
}));

describe('useEthereumProxy', () => {
  const mockDecodedQueryParams = {
    apiKey: 'testApiKey',
    ethNetwork: 'mainnet',
    version: '1',
    ext: {},
    sdkType: 'sdk',
    domainOrigin: 'origin',
  };

  beforeEach(() => {
    useStore.setState({ decodedQueryParams: mockDecodedQueryParams });
    (getNetworkName as jest.Mock).mockReturnValue('mainnet');
  });

  it('getChainId should return chain ID', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue({ result: 1 });
    (useMagicApiEthProxyQuery as jest.Mock).mockReturnValue({ mutateAsync: mockMutateAsync });

    const { result } = renderHook(() => useEthereumProxy());

    await act(async () => {
      const chainId = await result.current.getChainId();
      expect(chainId).toBe(1);
    });
  });

  it('getGasPrice should return gas price', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue({ result: '1000000000' });
    (useMagicApiEthProxyQuery as jest.Mock).mockReturnValue({ mutateAsync: mockMutateAsync });

    const { result } = renderHook(() => useEthereumProxy());

    await act(async () => {
      const gasPrice = await result.current.getGasPrice();
      expect(gasPrice).toBe('1000000000');
    });
  });

  it('estimateGas should estimate gas', async () => {
    const mockTx: Transaction = {
      from: '0x0',
      to: '0x1',
      value: getBigInt('1000'),
      nonce: 0,
      gasLimit: getBigInt('21000'),
      gasPrice: getBigInt('20000000000'), // 20 gwei
      data: '0x',
      // @ts-expect-error expects bigint
      chainId: 1, // Mainnet
    };
    const mockMutateAsync = jest.fn().mockResolvedValue({ result: 21000 });
    (useMagicApiEthProxyQuery as jest.Mock).mockReturnValue({ mutateAsync: mockMutateAsync });

    const { result } = renderHook(() => useEthereumProxy());

    await act(async () => {
      const gasEstimate = await result.current.estimateGas(mockTx);
      expect(gasEstimate).toBe(21000);
    });
  });

  it('getCode should return contract code', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue({ result: '0x60806040' });
    (useMagicApiEthProxyQuery as jest.Mock).mockReturnValue({ mutateAsync: mockMutateAsync });

    const { result } = renderHook(() => useEthereumProxy());

    await act(async () => {
      const code = await result.current.getCode('0x0');
      expect(code).toBe('0x60806040');
    });
  });

  it('getBlock should return block by number', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue({ result: '0x1' });
    (useMagicApiEthProxyQuery as jest.Mock).mockReturnValue({ mutateAsync: mockMutateAsync });

    const { result } = renderHook(() => useEthereumProxy());

    await act(async () => {
      const block = await result.current.getBlock('0x1', true);
      expect(block).toBe('0x1');
    });
  });

  it('ethCall should return eth call result', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue({ result: '0x' });
    (useMagicApiEthProxyQuery as jest.Mock).mockReturnValue({ mutateAsync: mockMutateAsync });

    const { result } = renderHook(() => useEthereumProxy());

    await act(async () => {
      const callResult = await result.current.ethCall('0x0', '0x');
      expect(callResult).toBe('0x');
    });
  });

  it('getBalance should return balance', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue({ result: '1000000000000000000' });
    (useMagicApiEthProxyQuery as jest.Mock).mockReturnValue({ mutateAsync: mockMutateAsync });

    const { result } = renderHook(() => useEthereumProxy());

    await act(async () => {
      const balance = await result.current.getBalance('0x0');
      expect(balance).toBe('1000000000000000000');
    });
  });

  it('getTransactionCount should return transaction count', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue({ result: 10 });
    (useMagicApiEthProxyQuery as jest.Mock).mockReturnValue({ mutateAsync: mockMutateAsync });

    const { result } = renderHook(() => useEthereumProxy());

    await act(async () => {
      const transactionCount = await result.current.getTransactionCount('0x0');
      expect(transactionCount).toBe(10);
    });
  });

  it('sendRawTransaction should send raw transaction', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue({ result: '0x1' });
    (useMagicApiEthProxyQuery as jest.Mock).mockReturnValue({ mutateAsync: mockMutateAsync });

    const { result } = renderHook(() => useEthereumProxy());

    await act(async () => {
      const txResult = await result.current.sendRawTransaction('0x0');
      expect(txResult).toBe('0x1');
    });
  });

  it('should handle custom node errors', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue({ error: { code: '123', message: 'Test error' } });
    (useCustomNodeEthProxyQuery as jest.Mock).mockReturnValue({ mutateAsync: mockMutateAsync });
    (isCustomNode as jest.Mock).mockReturnValue(true);
    (getCustomNodeNetworkUrl as jest.Mock).mockReturnValue('http://localhost:8545');

    const { result } = renderHook(() => useEthereumProxy());

    await act(async () => {
      try {
        await result.current.genericEthereumProxy({ jsonrpc: '2.0', id: '1', method: 'eth_chainId', params: [] });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as any).code).toBe('123');
        expect((error as any).message).toBe(`Error forwarded from node, Test error, undefined`);
      }
    });
  });

  it('should handle Magic API node errors', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue({ error: { code: '123', message: 'Test error' } });
    (useMagicApiEthProxyQuery as jest.Mock).mockReturnValue({ mutateAsync: mockMutateAsync });

    const { result } = renderHook(() => useEthereumProxy());

    await act(async () => {
      try {
        await result.current.genericEthereumProxy({ jsonrpc: '2.0', id: '1', method: 'eth_chainId', params: [] });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as any).code).toBe('123');
        expect((error as any).message).toBe(`Error forwarded from node, Test error, undefined`);
      }
    });
  });
});
