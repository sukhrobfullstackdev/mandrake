import Page from '@app/send/rpc/eth/personal_ecRecover/page';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import Web3Service from '@utils/web3-services/web3-service';
import { render, waitFor } from '@testing-library/react';

jest.mock('@hooks/common/json-rpc-request');
jest.mock('@lib/atomic-rpc-payload');
jest.mock('@utils/web3-services/web3-service');

describe('Page Component', () => {
  const mockResolveActiveRpcRequest = jest.fn();
  const mockRejectActiveRpcRequest = jest.fn();
  const mockActiveRpcPayload = { params: ['message', 'signature'] };

  beforeEach(() => {
    jest.clearAllMocks();
    (useResolveActiveRpcRequest as jest.Mock).mockReturnValue(mockResolveActiveRpcRequest);
    (useRejectActiveRpcRequest as jest.Mock).mockReturnValue(mockRejectActiveRpcRequest);
    (AtomicRpcPayloadService.getActiveRpcPayload as jest.Mock).mockReturnValue(mockActiveRpcPayload);
  });

  it('should call resolveActiveRpcRequest with the address the signature recovers to', async () => {
    (Web3Service.verifyMessage as jest.Mock).mockResolvedValue(Promise.resolve('expected_address'));
    (Web3Service.toChecksumAddress as jest.Mock).mockResolvedValue(Promise.resolve('expected_address'));

    render(<Page />);

    await waitFor(() => {
      expect(mockResolveActiveRpcRequest).toHaveBeenCalledWith('expected_address');
      expect(mockRejectActiveRpcRequest).not.toHaveBeenCalled();
    });
  });

  it('should call rejectActiveRpcRequest if verify signature throws an error', async () => {
    (Web3Service.verifyMessage as jest.Mock).mockResolvedValue(Promise.reject({ code: '-1', message: 'error' }));
    (Web3Service.toChecksumAddress as jest.Mock).mockResolvedValue(Promise.resolve('expected_address'));

    render(<Page />);

    await waitFor(() => {
      expect(mockResolveActiveRpcRequest).not.toHaveBeenCalled();
      expect(mockRejectActiveRpcRequest).toHaveBeenCalledWith('-1', 'error');
    });
  });
});
