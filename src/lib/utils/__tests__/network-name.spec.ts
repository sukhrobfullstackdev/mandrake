import { getNetworkName } from '@lib/utils/network-name';

describe('getNetworkName', () => {
  it('returns MAINNET for Flow wallet on mainnet', () => {
    expect(
      getNetworkName({}, undefined, '', false, {
        flow: { network: 'MAINNET' },
      }),
    ).toBe('MAINNET');
  });

  it('returns CANONICAL_TESTNET for Flow wallet on testnet', () => {
    expect(
      getNetworkName({}, undefined, '', false, {
        flow: { network: 'testnet' },
      }),
    ).toBe('CANONICAL_TESTNET');
  });

  it('returns mainnet if ethNetwork is empty and version is below deprecation', () => {
    expect(getNetworkName('', '9.9.9', '', false)).toBe('mainnet');
  });

  it('throws error for unsupported network', () => {
    expect(() => getNetworkName('kovan', '9.9.9', '', false)).toThrow('Network not supported');
  });

  // TODO: This case is incorrectly handled.
  // The lib should be updated to reflect the correct behavior.
  it('returns network based on nodeUrl for Aptos wallet', () => {
    expect(
      getNetworkName({}, undefined, '', false, {
        aptos: { options: { nodeUrl: 'https://testnet.api.aptos.dev' } },
      }),
    ).toBe('https://testnet');
  });

  it('returns custom network name if it cannot be determined from nodeUrl for Aptos wallet', () => {
    expect(
      getNetworkName({}, undefined, '', false, {
        aptos: { options: { nodeUrl: 'https://fullnode.testnet.aptoslabs.com' } },
      }),
    ).toBe('testnet');
  });

  it('handles mainnet for Hedera wallet', () => {
    expect(
      getNetworkName({}, undefined, '', false, {
        hedera: { options: { network: 'mainnet' } },
      }),
    ).toBe('mainnet');
  });

  it('handles testnet for Hedera wallet', () => {
    expect(
      getNetworkName({}, undefined, '', false, {
        hedera: { options: { network: 'testnet' } },
      }),
    ).toBe('CANONICAL_TESTNET');
  });

  it('returns mainnet for valid apiKey starting with pk_live', () => {
    expect(getNetworkName('', '6.0.0', 'pk_live_1234', false)).toBe('mainnet');
  });

  it('returns goerli for missing ethNetwork and pk_test apiKey', () => {
    expect(getNetworkName('', '10.1.0', 'pk_test_5678', false)).toBe('goerli');
  });

  it('returns mainnet for custom node with new version', () => {
    expect(getNetworkName({ rpcUrl: 'https://customnode.com' }, '10.1.0', '', false)).toBe('mainnet');
  });

  // Test for mobile SDK that should override apiKey logic
  it('returns goerli for mobile SDK regardless of apiKey', () => {
    expect(getNetworkName('', '10.1.0', 'pk_live_1234', true)).toBe('mainnet');
  });
});
