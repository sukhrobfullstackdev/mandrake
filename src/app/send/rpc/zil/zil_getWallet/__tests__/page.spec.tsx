import Page from '@app/send/rpc/zil/zil_getWallet/page';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useHydrateOrCreateMultichainWallet } from '@hooks/common/hydrate-or-create-wallets/hydrate-or-create-multichain-wallet';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { DkmsService } from '@lib/dkms';
import { createBridge } from '@lib/multichain/ledger-bridge';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';

const mockWallet = { publicAddress: '0x123', encryptedPrivateAddress: 'encryptedPrivateKey' };
const mockActiveRpcPayload = { params: ['0x123', 'message'] };
const mockBridge = { getWallet: jest.fn().mockResolvedValue('signature') };
const mockBridgeError = { getWallet: jest.fn().mockRejectedValue('error') };

jest.mock('@lib/multichain/ledger-bridge');
jest.mock('@hooks/common/json-rpc-request');
jest.mock('@lib/atomic-rpc-payload');
jest.mock('@lib/dkms');
jest.mock('@hooks/common/hydrate-session');
jest.mock('@hooks/common/hydrate-or-create-wallets/hydrate-or-create-multichain-wallet');

function executeRequest() {
  const queryClient = new QueryClient(TEST_CONFIG);
  return render(
    <QueryClientProvider client={queryClient}>
      <Page />
    </QueryClientProvider>,
  );
}

describe('Page Component', () => {
  const mockReject = jest.fn();
  const mockResolve = jest.fn();
  beforeEach(() => {
    jest.resetModules();
    (useResolveActiveRpcRequest as jest.Mock).mockReturnValue(mockResolve);
    (useRejectActiveRpcRequest as jest.Mock).mockReturnValue(mockReject);
    (useHydrateSession as jest.Mock).mockImplementation(() => ({ isError: false, isComplete: true }));
    (useHydrateOrCreateMultichainWallet as jest.Mock).mockImplementation(() => ({
      walletInfoData: mockWallet,
      credentialsData: 'foo',
    }));
    (createBridge as jest.Mock).mockResolvedValue(Promise.resolve({ ledgerBridge: mockBridge }));
    (AtomicRpcPayloadService.getActiveRpcPayload as jest.Mock).mockReturnValue(mockActiveRpcPayload);
  });

  afterEach(() => jest.clearAllMocks());

  it('user logged in: should call resolveActiveRpcRequest with successfuly generated signature', async () => {
    (DkmsService.reconstructSecret as jest.Mock).mockResolvedValue('decryptedPrivateKey');

    await waitFor(async () => {
      await executeRequest();
      expect(DkmsService.reconstructSecret).toHaveBeenCalledWith(expect.anything(), mockWallet.encryptedPrivateAddress);
      expect(mockBridge.getWallet).toHaveBeenCalledWith(mockActiveRpcPayload, 'decryptedPrivateKey');
      expect(mockResolve).toHaveBeenCalledWith('signature');
      expect(mockReject).not.toHaveBeenCalled();
    });
  });

  it('user logged in: should call rejectActiveRpcRequest if bridge throws error', async () => {
    (DkmsService.reconstructSecret as jest.Mock).mockResolvedValue('decryptedPrivateKey');
    (createBridge as jest.Mock).mockResolvedValue(Promise.resolve({ ledgerBridge: mockBridgeError }));
    await waitFor(async () => {
      await executeRequest();
      expect(DkmsService.reconstructSecret).toHaveBeenCalledWith(expect.anything(), mockWallet.encryptedPrivateAddress);
      expect(mockBridgeError.getWallet).toHaveBeenCalledWith(mockActiveRpcPayload, 'decryptedPrivateKey');
      expect(mockResolve).not.toHaveBeenCalledWith();
      expect(mockReject).toHaveBeenCalledWith(RpcErrorCode.InternalError, RpcErrorMessage.UserDeniedSigning);
    });
  });

  it('should call rejectActiveRpcRequest on hydration failure', async () => {
    (useHydrateSession as jest.Mock).mockImplementation(() => ({ isError: true, isComplete: true }));
    (useHydrateOrCreateMultichainWallet as jest.Mock).mockImplementation(() => ({
      walletInfoData: undefined,
      credentialsData: undefined,
    }));
    await waitFor(async () => {
      await executeRequest();
      expect(mockReject).toHaveBeenCalledWith(RpcErrorCode.InternalError, RpcErrorMessage.UserDeniedAccountAccess);
      expect(mockResolve).not.toHaveBeenCalled();
    });
  });

  it('should call rejectActiveRpcRequest on wallet hydration failure', async () => {
    (useHydrateSession as jest.Mock).mockImplementation(() => ({ isError: false, isComplete: true }));
    (useHydrateOrCreateMultichainWallet as jest.Mock).mockImplementation(() => ({
      walletInfoData: undefined,
      credentialsData: undefined,
      multichainWalletHydrationError: 'error',
    }));
    await waitFor(async () => {
      await executeRequest();
      expect(mockReject).toHaveBeenCalledWith(RpcErrorCode.InternalError, RpcErrorMessage.WalletHydrationError);
      expect(mockResolve).not.toHaveBeenCalled();
    });
  });

  it('should not do anything if there is no activeRpcPayload', async () => {
    (AtomicRpcPayloadService.getActiveRpcPayload as jest.Mock).mockReturnValue(null);
    await waitFor(async () => {
      await executeRequest();
      expect(mockResolve).not.toHaveBeenCalled();
      expect(mockReject).not.toHaveBeenCalled();
    });
  });
});
