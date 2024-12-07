import { fetchFlags } from '@app/actions';
import { type LDFlagSet } from '@launchdarkly/node-server-sdk';
import { type QueryFunction } from '@tanstack/react-query';
import { LaunchDarklyAllFlagsQueryKey } from '.';

export type LaunchDarklyAllFlagsResponse = LDFlagSet;

export const makeLaunchDarklyFlagsFetcher =
  (): QueryFunction<LaunchDarklyAllFlagsResponse, LaunchDarklyAllFlagsQueryKey> =>
  ({ queryKey: [, { apiKey }] }) => {
    return fetchFlags(apiKey);
  };
