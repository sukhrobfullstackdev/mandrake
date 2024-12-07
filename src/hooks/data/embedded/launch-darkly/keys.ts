export type LaunchDarklyAllFlagsServerStateQueryKey = ReturnType<typeof launchDarklyQueryKeys.allFlagsServerState>;

export type LaunchDarklyAllFlagsQueryKey = ReturnType<typeof launchDarklyQueryKeys.allFlags>;

interface AllFlagsServerStateParams {
  apiKey?: string;
}

interface AllFlagsParams {
  apiKey?: string;
}

export const launchDarklyQueryKeys = {
  base: ['launch-darkly'] as const,

  allFlagsServerState: (params: AllFlagsServerStateParams = {}) =>
    [[...launchDarklyQueryKeys.base, 'all-flags-server-state'], params] as const,

  allFlags: (params: AllFlagsParams = {}) => [[...launchDarklyQueryKeys.base, 'all-flags'], params] as const,
};
