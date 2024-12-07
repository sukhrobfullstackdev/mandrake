import Page from '@app/send/rpc/gdkms/magic_auth_decrypt_v1/page';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { render, waitFor } from '@testing-library/react';
const BrowserSecureContext = jest.requireMock('@utils/is-browser-secure-context');

const mockResolveActiveRpcRequest = jest.fn();
const mockRejectActiveRpcRequest = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

jest.mock('@hooks/common/hydrate-session', () => ({
  useHydrateSession: () => ({
    isError: false,
    isComplete: false,
  }),
}));

jest.mock('@lib/g-dkms/hash', () => ({
  createHashNative: () => 'hash',
}));

jest.mock('@hooks/common/hydrate-or-create-wallets/hydrate-or-create-eth-wallet', () => ({
  useHydrateOrCreateEthWallet: () => ({
    credentialsData: 'foo',
    walletInfoData: {},
  }),
}));

jest.mock('@hooks/common/json-rpc-request', () => ({
  useResolveActiveRpcRequest: () => mockResolveActiveRpcRequest,
  useRejectActiveRpcRequest: () => mockRejectActiveRpcRequest,
}));

jest.mock('@hooks/data/embedded/dkms/kms', () => ({
  kmsDecryptQuery: () => '0x',
}));

jest.mock('@utils/is-browser-secure-context', () => ({
  isBrowserSecureContext: true,
}));

function setup() {
  AtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_auth_decrypt_v1',
    id: 'my_id',
    params: [{ ciphertext: 'U2FsdGVkX18AAAAAAAAAAIc0NExdzudFqxaqrqKPrcc=' }],
  });

  return render(<Page />);
}

describe('GDKMS decrypt V1', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders null', async () => {
    const { container } = setup();
    await waitFor(() => {
      expect(container.childElementCount).toEqual(0);
    });
  });

  it('Should Decrypt Successfully', async () => {
    setup();
    await waitFor(() => {
      expect(mockResolveActiveRpcRequest).toHaveBeenCalledWith('test');
    });
  });

  it('if browser is not secured decrypt should fail', async () => {
    BrowserSecureContext.isBrowserSecureContext = false;
    setup();
    await waitFor(() => {
      expect(mockResolveActiveRpcRequest).not.toHaveBeenCalled();
      expect(mockRejectActiveRpcRequest).toHaveBeenCalledWith(
        RpcErrorCode.InternalError,
        RpcErrorMessage.InsecureBrowserContext,
      );
    });
  });
});
