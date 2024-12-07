import { DATADOG_CLIENT_KEY, DEPLOY_ENV, GIT_COMMIT_SHA, NODE_ENV } from '@constants/env';
import { Logger, StatusType, datadogLogs } from '@datadog/browser-logs';
import { getBaseAnalyticsProperties } from '@lib/message-channel/event-helper';

const logType = ['log', 'debug', 'info', 'warn', 'error'] as const;
type LogType = (typeof logType)[number];

datadogLogs.init({
  clientToken: DATADOG_CLIENT_KEY,
  site: 'datadoghq.com',
  service: 'mandrake',
  version: GIT_COMMIT_SHA,
  forwardErrorsToLogs: true,
  useCrossSiteSessionCookie: true,
  env: DEPLOY_ENV,
  sessionSampleRate: 100,
});

/* Use a Proxy to maintain the ability to use the
shorthand methods (like .log, .debug, .info, .warn, .error),
while allowing for getBaseAnalyticsProperties to be computed */
let proxiedLogger: Logger;

export function getClientLogger(): Logger {
  if (!proxiedLogger) {
    const baseLogger = datadogLogs.logger;
    baseLogger.setHandler(DEPLOY_ENV !== 'local' && NODE_ENV !== 'development' ? 'http' : 'console');

    proxiedLogger = new Proxy(baseLogger, {
      get(target, prop) {
        if (logType.includes(prop as LogType)) {
          return (message: string, messageContext?: Record<string, unknown>, status?: StatusType, error?: Error) => {
            const baseProperties = getBaseAnalyticsProperties();
            const combinedProperties = { ...baseProperties, ...messageContext };

            if (prop === 'log') {
              target.log(message, combinedProperties, status, error);
            } else {
              //@ts-expect-error Requires ugly "type as" to pass typing
              target[prop as keyof Logger](message, combinedProperties);
            }
          };
        }

        return target[prop as keyof Logger];
      },
    });
  }

  return proxiedLogger;
}
