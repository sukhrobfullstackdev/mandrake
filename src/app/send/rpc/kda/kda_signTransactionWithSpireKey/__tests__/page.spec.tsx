import Page from '@app/send/rpc/kda/kda_signTransactionWithSpireKey/page';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useHydrateOrCreateMultichainWallet } from '@hooks/common/hydrate-or-create-wallets/hydrate-or-create-multichain-wallet';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { createBridge } from '@lib/multichain/ledger-bridge';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';

const mockWallet = { publicAddress: '0x123', encryptedPrivateAddress: 'encryptedPrivateKey' };
const mockActiveRpcPayload = { params: ['0x123', 'message'] };
const mockKadenaBridge = { signTransactionWithSpireKey: jest.fn().mockResolvedValue('signature') };
const mockKadenaBridgeError = { signTransactionWithSpireKey: jest.fn().mockRejectedValue('error') };

jest.mock('@lib/multichain/ledger-bridge');
jest.mock('@hooks/common/json-rpc-request');
jest.mock('@lib/atomic-rpc-payload');
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

describe('Kda Sign Transaction with SpireKey', () => {
  const mockResolve = jest.fn();
  const mockReject = jest.fn();
  beforeEach(() => {
    jest.resetModules();
    (useResolveActiveRpcRequest as jest.Mock).mockReturnValue(mockResolve);
    (useRejectActiveRpcRequest as jest.Mock).mockReturnValue(mockReject);
    (useHydrateSession as jest.Mock).mockImplementation(() => ({ isError: false, isComplete: true }));
    (useHydrateOrCreateMultichainWallet as jest.Mock).mockImplementation(() => ({
      walletInfoData: mockWallet,
      credentialsData: 'foo',
    }));
    (createBridge as jest.Mock).mockResolvedValue(Promise.resolve({ ledgerBridge: mockKadenaBridge }));
    (AtomicRpcPayloadService.getActiveRpcPayload as jest.Mock).mockReturnValue(mockActiveRpcPayload);
  });
  afterEach(() => jest.clearAllMocks());

  it('user logged in: should call resolveActiveRpcRequest with successfuly generated Kadena signature', async () => {
    await waitFor(async () => {
      await executeRequest();
      expect(mockKadenaBridge.signTransactionWithSpireKey).toHaveBeenCalledWith(mockActiveRpcPayload);
      expect(mockResolve).toHaveBeenCalledWith('signature');
      expect(mockReject).not.toHaveBeenCalled();
    });
  });

  it('user logged in: should call rejectActiveRpcRequest if Kadena bridge throws error', async () => {
    (createBridge as jest.Mock).mockResolvedValue(Promise.resolve({ ledgerBridge: mockKadenaBridgeError }));
    await waitFor(async () => {
      await executeRequest();
      expect(mockKadenaBridgeError.signTransactionWithSpireKey).toHaveBeenCalledWith(mockActiveRpcPayload);
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

  it('should not do anything if there is no activeRpcPayload', async () => {
    (AtomicRpcPayloadService.getActiveRpcPayload as jest.Mock).mockReturnValue(null);
    await waitFor(async () => {
      await executeRequest();
      expect(mockResolve).not.toHaveBeenCalled();
      expect(mockReject).not.toHaveBeenCalled();
    });
  });
});