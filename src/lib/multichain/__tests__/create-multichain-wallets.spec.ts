import { ExtensionOptions } from '@custom-types/params';
import { useStore } from '@hooks/store';
import { createMultichainWallet } from '@lib/multichain/create-multichain-wallet';

const mockWallet = {
  privateKey: 'pk_123',
  address: '0x123',
  mnemonic: 'mnemonic123',
};

// Mock the entire ledgerMap module
jest.mock('@constants/ledger-map.ts', () => ({
  ledgerMap: {
    FlowBridge: jest.fn().mockResolvedValue({
      default: function (rpcUrl?: string, chainId?: string, extensionOptions?: ExtensionOptions) {
        this.rpcUrl = rpcUrl;
        this.chainId = chainId;
        this.extensionOptions = extensionOptions;
        this.connect = () => 'Connected';
        this.getBalance = () => Promise.resolve('1000');
        this.createWallet = () => mockWallet;
      },
    }),
    HederaBridge: jest.fn().mockResolvedValue({
      default: function (rpcUrl?: string, chainId?: string, extensionOptions?: ExtensionOptions) {
        this.rpcUrl = rpcUrl;
        this.chainId = chainId;
        this.extensionOptions = extensionOptions;
        this.connect = () => 'Connected';
        this.getBalance = () => Promise.resolve('1000');
        this.createWallet = () => mockWallet;
      },
    }),
    SolanaBridge: jest.fn().mockResolvedValue({
      default: function (rpcUrl?: string, chainId?: string, extensionOptions?: ExtensionOptions) {
        this.rpcUrl = rpcUrl;
        this.chainId = chainId;
        this.extensionOptions = extensionOptions;
        this.connect = () => 'Connected';
        this.getBalance = () => Promise.resolve('1000');
        this.createWallet = () => mockWallet;
      },
    }),
  },
}));

describe('createMultichainWallet function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a Flow wallet', async () => {
    useStore.setState({
      authUserId: 'user123',
      decodedQueryParams: {
        ethNetwork: 'mainnet',
        apiKey: 'pk_live_api123',
        ext: {
          flow: { rpcUrl: 'https://rest-mainnet.onflow.org', chainType: 'FLOW', network: 'mainnet' },
        },
      },
    });
    const result = await createMultichainWallet({
      getAccount: jest.fn(),
      hederaSign: jest.fn(),
      flowSeedWallet: jest.fn(),
    });

    expect(result).toEqual(mockWallet);
  });

  it('should create a Hedera wallet', async () => {
    useStore.setState({
      authUserId: 'user123',
      decodedQueryParams: {
        apiKey: 'pk_live_api123',
        ethNetwork: 'mainnet',
        ext: { hedera: { chainType: 'HEDERA', options: { network: 'mainnet' } } },
      },
    });

    const result = await createMultichainWallet({
      getAccount: jest.fn(),
      hederaSign: jest.fn(),
      flowSeedWallet: jest.fn(),
    });
    expect(result).toEqual(mockWallet);
  });

  it('should create a Solana wallet', async () => {
    useStore.setState({
      authUserId: 'user123',
      decodedQueryParams: {
        apiKey: 'pk_live_api123',
        ethNetwork: 'mainnet',
        ext: { solana: { rpcUrl: 'https://api.devnet.solana.com', chainType: 'SOLANA' } },
      },
    });

    const result = await createMultichainWallet({
      getAccount: jest.fn(),
      hederaSign: jest.fn(),
      flowSeedWallet: jest.fn(),
    });

    expect(result).toEqual(mockWallet);
  });
});
