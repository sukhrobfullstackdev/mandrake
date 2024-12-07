import SendGaslessTransactionPage from '@app/send/rpc/eth/eth_sendGaslessTransaction/page';
import { useClientConfigFeatureFlags, useClientId } from '@hooks/common/client-config';
import { getWalletInfoAndCredentials } from '@hooks/common/hydrate-or-create-wallets/wallet-info-and-credentials';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useSubmitGaslessTransactionMutation } from '@hooks/data/embedded/gasless-transactions';
import { useUserInfoQuery } from '@hooks/data/embedded/user';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { buildForwardPayload } from '@lib/utils/gasless-transactions';
import Web3Service from '@lib/utils/web3-services/web3-service';
import { act, render } from '@testing-library/react';

const mockWallet = { publicAddress: '0x123', encryptedPrivateAddress: 'encryptedPrivateKey' };

jest.mock('@lib/atomic-rpc-payload');
jest.mock('@hooks/common/client-config');
jest.mock('@hooks/common/hydrate-session');
jest.mock('@hooks/common/json-rpc-request');
jest.mock('@hooks/data/embedded/gasless-transactions', () => ({
  useSubmitGaslessTransactionMutation: jest.fn(() => ({
    mutateAsync: jest.fn().mockResolvedValue('mockResponse'),
  })),
}));
jest.mock('@hooks/data/embedded/user', () => ({
  useUserInfoQuery: jest.fn(() => ({
    data: {
      publicAddress: 'mockPubAddr',
    },
    error: null,
  })),
  userQueryKeys: {
    info: jest.fn(() => 'info'),
  },
}));
jest.mock('@hooks/store', () => ({
  useStore: jest.fn(selector =>
    selector({
      authUserId: 'testUserId',
      authUserSessionToken: 'testToken',
    }),
  ),
}));
jest.mock('@lib/dkms');
jest.mock('@lib/utils/web3-services/web3-service');
jest.mock('@lib/utils/gasless-transactions');
jest.mock('@hooks/common/hydrate-or-create-wallets/wallet-info-and-credentials', () => ({
  getWalletInfoAndCredentials: jest.fn(() => ({
    walletInfoData: mockWallet,
    credentialsData: 'foo',
  })),
}));

describe('SendGaslessTransactionPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    (useClientId as jest.Mock).mockReturnValue({ clientId: 'testClientId' });
    (useHydrateSession as jest.Mock).mockReturnValue({ isComplete: true, isError: false });
    (getWalletInfoAndCredentials as jest.Mock).mockImplementation(() => ({
      walletInfoData: mockWallet,
      credentialsData: 'foo',
    }));
    render(<SendGaslessTransactionPage />);
  });

  it('should reject the request if hydrate session fails', async () => {
    const mockRejectActiveRpcRequest = jest.fn();
    (useRejectActiveRpcRequest as jest.Mock).mockReturnValue(mockRejectActiveRpcRequest);
    (useHydrateSession as jest.Mock).mockReturnValue({ isComplete: true, isError: true });
    (AtomicRpcPayloadService.getActiveRpcPayload as jest.Mock).mockReturnValue({});

    await act(() => {
      render(<SendGaslessTransactionPage />);
    });

    expect(mockRejectActiveRpcRequest).toHaveBeenCalledWith(
      expect.any(Number),
      expect.stringContaining('User denied account access'),
    );
  });

  it('should reject the request if gasless transactions are not enabled', async () => {
    const mockRejectActiveRpcRequest = jest.fn();
    (useRejectActiveRpcRequest as jest.Mock).mockReturnValue(mockRejectActiveRpcRequest);
    (useClientConfigFeatureFlags as jest.Mock).mockReturnValue({ isGaslessTransactionsEnabled: false });
    (AtomicRpcPayloadService.getActiveRpcPayload as jest.Mock).mockReturnValue({});
    (useUserInfoQuery as jest.Mock).mockReturnValue({ data: {}, error: null });
    (getWalletInfoAndCredentials as jest.Mock).mockReturnValue({ walletInfoData: {}, credentialsData: {} });
    (useHydrateSession as jest.Mock).mockReturnValue({ isComplete: true, isError: false });
    (useClientId as jest.Mock).mockReturnValue({ clientId: 'testClientId' });

    await act(() => {
      render(<SendGaslessTransactionPage />);
    });

    expect(mockRejectActiveRpcRequest).toHaveBeenCalledWith(
      expect.any(Number),
      expect.stringContaining('Gasless transactions not enabled'),
    );
  });

  it('should process a valid gasless transaction request', async () => {
    const mockResolveActiveRpcRequest = jest.fn();
    const mockSubmitGaslessTransaction = jest.fn().mockResolvedValue('transactionHash');
    (useResolveActiveRpcRequest as jest.Mock).mockReturnValue(mockResolveActiveRpcRequest);
    (useSubmitGaslessTransactionMutation as jest.Mock).mockReturnValue({ mutateAsync: mockSubmitGaslessTransaction });
    (useClientConfigFeatureFlags as jest.Mock).mockReturnValue({ isGaslessTransactionsEnabled: true });
    (AtomicRpcPayloadService.getActiveRpcPayload as jest.Mock).mockReturnValue({ params: ['0x1234', {}] });
    (useUserInfoQuery as jest.Mock).mockReturnValue({ data: { publicAddress: '0x1234' }, error: null });
    (getWalletInfoAndCredentials as jest.Mock).mockReturnValue({ walletInfoData: {}, credentialsData: {} });
    (useClientId as jest.Mock).mockReturnValue({ clientId: 'testClientId' });
    (Web3Service.compareAddresses as jest.Mock).mockResolvedValue(true);
    (buildForwardPayload as jest.Mock).mockResolvedValue({});
    (Web3Service.signTypedDataV4 as jest.Mock).mockResolvedValue('signature');

    await act(() => {
      render(<SendGaslessTransactionPage />);
    });

    expect(mockSubmitGaslessTransaction).toHaveBeenCalled();
    expect(mockResolveActiveRpcRequest).toHaveBeenCalledWith('transactionHash');
  });

  it('should reject the request if addresses do not match', async () => {
    const mockRejectActiveRpcRequest = jest.fn();
    (useRejectActiveRpcRequest as jest.Mock).mockReturnValue(mockRejectActiveRpcRequest);
    (useClientConfigFeatureFlags as jest.Mock).mockReturnValue({ isGaslessTransactionsEnabled: true });
    (AtomicRpcPayloadService.getActiveRpcPayload as jest.Mock).mockReturnValue({ params: ['0x1234', {}] });
    (useUserInfoQuery as jest.Mock).mockReturnValue({ data: { publicAddress: '0x5678' }, error: null });
    (getWalletInfoAndCredentials as jest.Mock).mockReturnValue({ walletInfoData: {}, credentialsData: {} });
    (Web3Service.compareAddresses as jest.Mock).mockResolvedValue(false);

    await act(() => {
      render(<SendGaslessTransactionPage />);
    });

    expect(mockRejectActiveRpcRequest).toHaveBeenCalledWith(
      expect.any(Number),
      expect.stringContaining('Signer address does not match logged in user'),
    );
  });
});
