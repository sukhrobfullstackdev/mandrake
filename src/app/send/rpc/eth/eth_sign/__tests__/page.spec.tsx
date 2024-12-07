import Page from '@app/send/rpc/eth/eth_sign/page';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { DkmsService } from '@lib/dkms';
import Web3Service from '@utils/web3-services/web3-service';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import { useStore } from '@hooks/store';

const mockEthWalletInfo = { publicAddress: '0x123', encryptedPrivateAddress: 'encryptedPrivateKey' };
const mockActiveRpcPayload = { params: ['0x123', 'message'] };

jest.mock('@hooks/common/ethereum-proxy');
jest.mock('@hooks/common/json-rpc-request');
jest.mock('@lib/atomic-rpc-payload');
jest.mock('@utils/web3-services/web3-service');
jest.mock('@lib/dkms');

jest.mock('@hooks/common/hydrate-session', () => ({
  useHydrateSession: jest.fn().mockImplementation(() => ({ isError: true, isComplete: true })),
}));

jest.mock('@hooks/common/hydrate-or-create-wallets/wallet-info-and-credentials', () => ({
  getWalletInfoAndCredentials: () => ({
    awsCreds: 'foo',
    walletInfoData: mockEthWalletInfo,
  }),
}));

function executeRequest() {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <Page />
    </QueryClientProvider>,
  );
}

describe('Page Component', () => {
  const mockResolveActiveRpcRequest = jest.fn();
  const mockRejectActiveRpcRequest = jest.fn();

  beforeEach(() => {
    useStore.setState({ authUserId: 'user123', authUserSessionToken: 'token123' });
    jest.resetModules();
    (useResolveActiveRpcRequest as jest.Mock).mockReturnValue(mockResolveActiveRpcRequest);
    (useRejectActiveRpcRequest as jest.Mock).mockReturnValue(mockRejectActiveRpcRequest);
    (useHydrateSession as jest.Mock).mockImplementation(() => ({ isError: false, isComplete: true }));
    (AtomicRpcPayloadService.getActiveRpcPayload as jest.Mock).mockReturnValue(mockActiveRpcPayload);
  });

  afterEach(() => jest.clearAllMocks());

  it('expected signer: should call resolveActiveRpcRequest with successfuly generated signature', async () => {
    (Web3Service.compareAddresses as jest.Mock).mockResolvedValue(Promise.resolve(true));
    (DkmsService.reconstructSecret as jest.Mock).mockResolvedValue('decryptedPrivateKey');
    (Web3Service.ethSign as jest.Mock).mockResolvedValue('signature');

    await waitFor(async () => {
      await executeRequest();

      expect(Web3Service.compareAddresses).toHaveBeenCalledWith([
        mockActiveRpcPayload.params[0],
        mockEthWalletInfo.publicAddress,
      ]);
      expect(DkmsService.reconstructSecret).toHaveBeenCalledWith('foo', mockEthWalletInfo.encryptedPrivateAddress);
      expect(Web3Service.ethSign).toHaveBeenCalledWith(mockActiveRpcPayload.params[1], 'decryptedPrivateKey');
      expect(mockResolveActiveRpcRequest).toHaveBeenCalledWith('signature');
      expect(mockRejectActiveRpcRequest).not.toHaveBeenCalled();
    });
  });

  it('unexpected signer: should call rejectActiveRpcRequest with user denied signing error', async () => {
    (Web3Service.compareAddresses as jest.Mock).mockResolvedValue(Promise.resolve(false));
    await waitFor(async () => {
      await executeRequest();

      expect(Web3Service.compareAddresses).toHaveBeenCalledWith([
        mockActiveRpcPayload.params[0],
        mockEthWalletInfo.publicAddress,
      ]);
      expect(DkmsService.reconstructSecret).not.toHaveBeenCalled();
      expect(Web3Service.ethSign).not.toHaveBeenCalled();
      expect(mockResolveActiveRpcRequest).not.toHaveBeenCalled();
      expect(mockRejectActiveRpcRequest).toHaveBeenCalledWith(
        RpcErrorCode.InternalError,
        RpcErrorMessage.SignerMismatch,
      );
    });
  });

  it('should call rejectActiveRpcRequest on hydration failure', async () => {
    (useHydrateSession as jest.Mock).mockImplementation(() => ({ isError: true, isComplete: true }));
    await waitFor(async () => {
      await executeRequest();

      expect(mockRejectActiveRpcRequest).toHaveBeenCalledWith(
        RpcErrorCode.InternalError,
        RpcErrorMessage.UserDeniedAccountAccess,
      );
      expect(mockResolveActiveRpcRequest).not.toHaveBeenCalled();
    });
  });

  it('should not do anything if there is no activeRpcPayload', async () => {
    (AtomicRpcPayloadService.getActiveRpcPayload as jest.Mock).mockReturnValue(null);

    await waitFor(async () => {
      await executeRequest();
      expect(mockResolveActiveRpcRequest).not.toHaveBeenCalled();
      expect(mockRejectActiveRpcRequest).not.toHaveBeenCalled();
    });
  });
});
