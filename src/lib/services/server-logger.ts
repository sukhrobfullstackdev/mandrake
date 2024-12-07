import { GIT_COMMIT_SHA } from '@constants/env';
import { getBaseAnalyticsProperties } from '@lib/message-channel/event-helper';
import { createLogger, format, format as formatFunction } from 'winston';
import transports from 'winston/lib/winston/transports';

function stripFalsyValues(obj: object): object {
  const filteredEntries = Object.entries(obj).filter(([, value]) => value);
  return Object.fromEntries(filteredEntries);
}

type Log = {
  message: string;
  level: string;
} & Record<string, unknown>;

// Passes the base properties to the logger along with custom properties
// given to the log function
const customFormatter = formatFunction((info: Log) => {
  return Object.assign(info, stripFalsyValues(getBaseAnalyticsProperties()));
});

export const serverLogger = createLogger({
  level: 'info',
  exitOnError: false,
  format: format.combine(customFormatter(), format.json()),
  defaultMeta: {
    version: GIT_COMMIT_SHA,
  },
  transports: [new transports.Console()],
});
