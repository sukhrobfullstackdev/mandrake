import Page from '@app/send/rpc/eth/net_version/page';
import { useEthereumProxy } from '@hooks/common/ethereum-proxy';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { render, waitFor } from '@testing-library/react';

jest.mock('@hooks/common/json-rpc-request');
jest.mock('@hooks/common/ethereum-proxy');
jest.mock('@lib/atomic-rpc-payload');

describe('Page Component', () => {
  const mockRejectActiveRpcRequest = jest.fn();
  const mockResolveActiveRpcRequest = jest.fn();
  const mockGenericEthereumProxy = jest.fn();
  const mockGetActiveRpcPayload = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRejectActiveRpcRequest as jest.Mock).mockReturnValue(mockRejectActiveRpcRequest);
    (useResolveActiveRpcRequest as jest.Mock).mockReturnValue(mockResolveActiveRpcRequest);
    (useEthereumProxy as jest.Mock).mockReturnValue({ genericEthereumProxy: mockGenericEthereumProxy });
    (AtomicRpcPayloadService.getActiveRpcPayload as jest.Mock).mockImplementation(mockGetActiveRpcPayload);
  });

  it('does nothing if activeRpcPayload is null', () => {
    mockGetActiveRpcPayload.mockReturnValue(null);

    render(<Page />);

    expect(mockResolveActiveRpcRequest).not.toHaveBeenCalled();
    expect(mockRejectActiveRpcRequest).not.toHaveBeenCalled();
    expect(mockGenericEthereumProxy).not.toHaveBeenCalled();
  });

  it('resolves the RPC request successfully', async () => {
    const mockPayload = { id: 1, jsonrpc: '2.0', method: 'net_version', params: [] };
    const mockResponse = { result: '1' };

    mockGetActiveRpcPayload.mockReturnValue(mockPayload);
    mockGenericEthereumProxy.mockResolvedValueOnce(mockResponse);

    render(<Page />);

    await waitFor(() => {
      expect(mockGenericEthereumProxy).toHaveBeenCalledWith(mockPayload);
      expect(mockResolveActiveRpcRequest).toHaveBeenCalledWith(mockResponse);
      expect(mockRejectActiveRpcRequest).not.toHaveBeenCalled();
    });
  });

  it('rejects the RPC request on error', async () => {
    const mockPayload = { id: 1, jsonrpc: '2.0', method: 'net_version', params: [] };
    const mockError = { code: -32000, message: 'Internal error' };

    mockGetActiveRpcPayload.mockReturnValue(mockPayload);
    mockGenericEthereumProxy.mockRejectedValueOnce(mockError);

    render(<Page />);

    await waitFor(() => {
      expect(mockGenericEthereumProxy).toHaveBeenCalledWith(mockPayload);
      expect(mockRejectActiveRpcRequest).toHaveBeenCalledWith(mockError.code, mockError.message);
      expect(mockResolveActiveRpcRequest).not.toHaveBeenCalled();
    });
  });

  it('does not process if the request has already been resolved or rejected', async () => {
    const mockPayload = { id: 1, jsonrpc: '2.0', method: 'net_version', params: [] };

    mockGetActiveRpcPayload.mockReturnValue(mockPayload);
    mockGenericEthereumProxy.mockResolvedValueOnce({ result: '1' });

    const { rerender } = render(<Page />);

    await waitFor(() => {
      expect(mockGenericEthereumProxy).toHaveBeenCalled();
      expect(mockResolveActiveRpcRequest).toHaveBeenCalled();
    });

    mockGenericEthereumProxy.mockClear();
    rerender(<Page />);

    await waitFor(() => {
      expect(mockGenericEthereumProxy).not.toHaveBeenCalled();
    });
  });
});
