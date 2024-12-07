import ConnectWalletPage from '@app/send/rpc/wallet/mc_login/__components__/connect-wallet';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { IntermediaryEvents } from '@magic-sdk/types';
import { render, screen } from '@testing-library/react';

const mockReplace = jest.fn();
const mockGet = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

jest.mock('@hooks/data/embedded/third-party-wallet', () => ({
  useThirdPartyWalletStartQuery: jest.fn().mockImplementation(() => ({
    mutate: jest.fn(),
    isPending: false,
    error: null,
    reset: jest.fn(),
    isSuccess: false,
  })),
  useSendEmailOtpStartQuery: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
}));

function setup() {
  return render(<ConnectWalletPage />);
}

describe('Connect Wallet', () => {
  beforeEach(() => {
    jest.resetModules(); // Reset cache
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders connect wallet button', () => {
    setup();
    const connectWalletButton = screen.getByLabelText('connect-wallet');
    expect(connectWalletButton).toBeInTheDocument();
  });

  it('calls handler on intermediary event', () => {
    setup();
    const handle = jest.fn();
    const payload = {
      jsonrpc: '2.0',
      id: 1,
      method: 'method',
      params: [],
    };
    const inboundEvent = { eventType: 'wallet_connected' as IntermediaryEvents, payloadId: payload.id, args: '0x123' };
    AtomicRpcPayloadService.setActiveRpcPayload(payload);
    AtomicRpcPayloadService.onEvent('wallet_connected' as IntermediaryEvents, handle);
    AtomicRpcPayloadService.handleRequestEvent(inboundEvent);
    expect(handle).toHaveBeenCalledTimes(1);
  });
});
