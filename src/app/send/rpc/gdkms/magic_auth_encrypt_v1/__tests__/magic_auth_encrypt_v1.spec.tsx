import Page from '@app/send/rpc/gdkms/magic_auth_encrypt_v1/page';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { render, waitFor } from '@testing-library/react';
import { DkmsService } from '@lib/dkms';
const BrowserSecureContext = jest.requireMock('@utils/is-browser-secure-context');

const mockResolveActiveRpcRequest = jest.fn();
const mockRejectActiveRpcRequest = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

jest.mock('@lib/dkms');

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

jest.mock('@utils/is-browser-secure-context', () => ({
  isBrowserSecureContext: true,
}));

function setup() {
  AtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_auth_encrypt_v1',
    id: 'my_id',
    params: [{ message: 'test' }],
  });

  return render(<Page />);
}

describe('GDKMS encrypt V1', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders null', async () => {
    const { container } = setup();
    await waitFor(() => {
      expect(container.childElementCount).toEqual(0);
    });
  });

  it('Should Encrypt Successfully', async () => {
    (DkmsService.reconstructSecret as jest.Mock).mockResolvedValue('0x');
    setup();
    await waitFor(() => {
      expect(mockResolveActiveRpcRequest).toHaveBeenCalledWith('U2FsdGVkX18AAAAAAAAAAIc0NExdzudFqxaqrqKPrcc=');
    });
  });

  it('if browser is not secured encrypt should fail', async () => {
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
