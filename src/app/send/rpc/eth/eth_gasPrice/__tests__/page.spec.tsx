import Page from '@app/send/rpc/eth/eth_gasPrice/page';
import { useEthereumProxy } from '@hooks/common/ethereum-proxy';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { render, waitFor } from '@testing-library/react';

jest.mock('@hooks/common/ethereum-proxy');
jest.mock('@hooks/common/json-rpc-request');
jest.mock('@lib/atomic-rpc-payload');

describe('Page Component', () => {
  const mockGetGasPrice = jest.fn();
  const mockResolveActiveRpcRequest = jest.fn();
  const mockRejectActiveRpcRequest = jest.fn();
  const mockActiveRpcPayload = {};

  beforeEach(() => {
    jest.clearAllMocks();
    (useEthereumProxy as jest.Mock).mockReturnValue({
      getGasPrice: mockGetGasPrice,
    });
    (useResolveActiveRpcRequest as jest.Mock).mockReturnValue(mockResolveActiveRpcRequest);
    (useRejectActiveRpcRequest as jest.Mock).mockReturnValue(mockRejectActiveRpcRequest);
    (AtomicRpcPayloadService.getActiveRpcPayload as jest.Mock).mockReturnValue(mockActiveRpcPayload);
  });

  it('should call resolveActiveRpcRequest with gas price on success', async () => {
    const gasPrice = '100';
    mockGetGasPrice.mockResolvedValue(gasPrice);

    render(<Page />);

    await waitFor(() => {
      expect(mockResolveActiveRpcRequest).toHaveBeenCalledWith(gasPrice);
      expect(mockRejectActiveRpcRequest).not.toHaveBeenCalled();
    });
  });

  it('should call rejectActiveRpcRequest with error code and message on failure', async () => {
    const error = { code: 123, message: 'Error message' };
    mockGetGasPrice.mockRejectedValue(error);

    render(<Page />);

    await waitFor(() => {
      expect(mockRejectActiveRpcRequest).toHaveBeenCalledWith(error.code, error.message);
      expect(mockResolveActiveRpcRequest).not.toHaveBeenCalled();
    });
  });

  it('should not do anything if hasResolvedOrRejected is true', async () => {
    const gasPrice = '100';
    mockGetGasPrice.mockResolvedValue(gasPrice);

    const { rerender } = render(<Page />);

    await waitFor(() => {
      expect(mockResolveActiveRpcRequest).toHaveBeenCalledWith(gasPrice);
    });

    rerender(<Page />);

    expect(mockResolveActiveRpcRequest).toHaveBeenCalledTimes(1);
  });

  it('should not do anything if there is no activeRpcPayload', async () => {
    (AtomicRpcPayloadService.getActiveRpcPayload as jest.Mock).mockReturnValue(null);

    render(<Page />);

    await waitFor(() => {
      expect(mockResolveActiveRpcRequest).not.toHaveBeenCalled();
      expect(mockRejectActiveRpcRequest).not.toHaveBeenCalled();
    });
  });
});
