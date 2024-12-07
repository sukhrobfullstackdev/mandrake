import { LDFlagSet } from '@launchdarkly/node-server-sdk';
import * as GetQueryClient from '@lib/server/query-client';
import { getMockUseQueryResult } from '@mocks/react-query';
import { renderHook } from '@testing-library/react';
import * as LaunchDarklyHooks from '../launch-darkly';

jest.mock('@hooks/data/embedded/launch-darkly', () => ({
  useFlagsQuery: jest
    .fn()
    .mockImplementation(
      jest.fn().mockReturnValue(getMockUseQueryResult<LDFlagSet>({ testFlag: false, makeItSo: true })),
    ),
  makeLaunchDarklyFlagsFetcher: jest.fn(),
  launchDarklyQueryKeys: {
    allFlags: jest.fn().mockReturnValue(['launchDarkly', 'allFlags']),
  },
}));

jest.mock('@lib/server/query-client', () => ({
  __esModule: true,
  getServerQueryClient: jest.fn().mockReturnValue({
    prefetchQuery: jest.fn(),
  }),
}));

describe('hookes/common/launch-darkly', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useFlags', () => {
    it('should return flags if they exist', () => {
      const { result } = renderHook(LaunchDarklyHooks.useFlags);
      expect(result.current).toEqual({ testFlag: false, makeItSo: true });
    });
  });

  describe('usePrefetchFlags', () => {
    it('should prefetch flags with correct arguments', async () => {
      renderHook(LaunchDarklyHooks.usePrefetchFlags);
      expect((await GetQueryClient.getServerQueryClient()).prefetchQuery).toHaveBeenCalledWith({
        queryKey: ['launchDarkly', 'allFlags'],
        queryFn: undefined,
        gcTime: 1000 * 60 * 10,
        staleTime: 1000 * 60 * 1,
      });
    });
  });
});
