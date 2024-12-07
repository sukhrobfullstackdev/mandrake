import { SDKType } from '@constants/sdk-type';
import { isOptimism, supportsCustomNode } from '@lib/utils/network';

describe('supportsCustomNode', () => {
  it('should return true for SDKType.MagicRN', () => {
    expect(supportsCustomNode(SDKType.MagicRN)).toBe(true);
  });

  it('should return true for SDKType.MagicBareRN', () => {
    expect(supportsCustomNode(SDKType.MagicBareRN)).toBe(true);
  });

  it('should return true for SDKType.MagicExpoRN', () => {
    expect(supportsCustomNode(SDKType.MagicExpoRN)).toBe(true);
  });

  it('should return true for SDKType.MagicSDK', () => {
    expect(supportsCustomNode(SDKType.MagicSDK)).toBe(true);
  });

  it('should return true for SDKType.MagicIOS', () => {
    expect(supportsCustomNode(SDKType.MagicIOS)).toBe(true);
  });

  it('should return true for SDKType.MagicAndroid', () => {
    expect(supportsCustomNode(SDKType.MagicAndroid)).toBe(true);
  });

  it('should return true for SDKType.MagicFlutter', () => {
    expect(supportsCustomNode(SDKType.MagicFlutter)).toBe(true);
  });

  it('should return true for SDKType.MagicUnity', () => {
    expect(supportsCustomNode(SDKType.MagicUnity)).toBe(true);
  });

  it('should return false for an undefined SDKType', () => {
    expect(supportsCustomNode('some-unsupported-sdk')).toBe(false);
  });
});

describe('isOptimism', () => {
  it('should return true for optimistic-goerli', () => {
    expect(isOptimism('optimistic-goerli')).toBe(true);
  });

  it('should return true for optimistic-mainnet', () => {
    expect(isOptimism('optimistic-mainnet')).toBe(true);
  });

  it('should return false for an undefined network', () => {
    expect(isOptimism('some-unsupported-network')).toBe(false);
  });
});
