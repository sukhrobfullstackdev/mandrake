import { LaunchDarklyAllFlagsServerStateQueryKey } from '@hooks/data/embedded/launch-darkly';
import * as LD from '@launchdarkly/node-server-sdk';
import { serverLogger } from '@lib/services/server-logger';
import { QueryFunction } from '@tanstack/react-query';

export type LaunchDarklyAllFlagsServerResponse = LD.LDFlagSet;

let launchDarklyClient: LD.LDClient | undefined;

const initialize = async () => {
  if (!process.env.LAUNCH_DARKLY_SDK_KEY) {
    serverLogger.error('No LaunchDarkly SDK key found');
  }

  try {
    const logger: LD.LDLogger = LD.basicLogger({
      level: 'warn',
    });

    launchDarklyClient = LD.init(process.env.LAUNCH_DARKLY_SDK_KEY || '', { logger });
    await launchDarklyClient.waitForInitialization({ timeout: 30 });
  } catch (e) {
    serverLogger.error('There as an issue initializing LaunchDarkly', e);
  }
};

const getLaunchDarklyServerClient = async () => {
  if (launchDarklyClient) {
    await launchDarklyClient.waitForInitialization({ timeout: 30 });
    return launchDarklyClient;
  }

  await initialize();

  return launchDarklyClient;
};

export const allFlagsFromLaunchDarklyFetcher: QueryFunction<
  LaunchDarklyAllFlagsServerResponse,
  LaunchDarklyAllFlagsServerStateQueryKey
> = async ({ queryKey: [, { apiKey }] }) => {
  const ldClient = await getLaunchDarklyServerClient();
  const flagState = await ldClient?.allFlagsState({
    kind: 'user',
    key: apiKey || 'fallback',
  });

  return flagState?.allValues();
};
