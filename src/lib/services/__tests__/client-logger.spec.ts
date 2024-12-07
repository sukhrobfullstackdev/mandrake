import { datadogLogs } from '@datadog/browser-logs';
import { getClientLogger } from '@lib/services/client-logger';

const defaults = {
  api_key: '',
  blockchain: 'ethereum mainnet',
  chainId: '1',
  env: 'test-testnet',
  eventOrigin: '',
  json_rpc_method: undefined,
  rpcUrl: 'mainnet',
  sdk: 'SdkMissing',
  source: 'mandrake-magic',
  uid: null,
  walletType: 'ETH',
};

jest.mock('@datadog/browser-logs', () => ({
  datadogLogs: {
    init: jest.fn(),
    logger: {
      log: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      setHandler: jest.fn(),
    },
  },
}));

describe('@lib/services/logging', () => {
  const logger = getClientLogger();

  beforeAll(() => {
    jest.resetModules(); // Reset cache
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should output a generic log', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const errObj = new Error();

    logger.log('Foo bar', { bat: 'baz' }, 'error', errObj);

    expect(datadogLogs.logger.log).toHaveBeenCalledWith('Foo bar', { bat: 'baz', ...defaults }, 'error', errObj);
    expect(datadogLogs.logger.debug).toHaveBeenCalledTimes(0);
    expect(datadogLogs.logger.info).toHaveBeenCalledTimes(0);
    expect(datadogLogs.logger.warn).toHaveBeenCalledTimes(0);
    expect(datadogLogs.logger.error).toHaveBeenCalledTimes(0);
    expect(consoleSpy).toHaveBeenCalledTimes(0);
  });

  it('should output an info log', async () => {
    const consoleSpy = jest.spyOn(console, 'info').mockImplementation(() => {});

    logger.info('Foo bar');

    expect(datadogLogs.logger.info).toHaveBeenCalledWith('Foo bar', defaults);
    expect(datadogLogs.logger.log).toHaveBeenCalledTimes(0);
    expect(datadogLogs.logger.debug).toHaveBeenCalledTimes(0);
    expect(datadogLogs.logger.warn).toHaveBeenCalledTimes(0);
    expect(datadogLogs.logger.error).toHaveBeenCalledTimes(0);
    expect(consoleSpy).toHaveBeenCalledTimes(0);
  });

  it('should output a debug log', async () => {
    const consoleSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});

    logger.debug('Foo bar');

    expect(datadogLogs.logger.debug).toHaveBeenCalledWith('Foo bar', defaults);
    expect(datadogLogs.logger.log).toHaveBeenCalledTimes(0);
    expect(datadogLogs.logger.info).toHaveBeenCalledTimes(0);
    expect(datadogLogs.logger.warn).toHaveBeenCalledTimes(0);
    expect(datadogLogs.logger.error).toHaveBeenCalledTimes(0);
    expect(consoleSpy).toHaveBeenCalledTimes(0);
  });

  it('should output a warning log', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    logger.warn('Foo bar');

    expect(datadogLogs.logger.warn).toHaveBeenCalledWith('Foo bar', defaults);
    expect(datadogLogs.logger.log).toHaveBeenCalledTimes(0);
    expect(datadogLogs.logger.debug).toHaveBeenCalledTimes(0);
    expect(datadogLogs.logger.info).toHaveBeenCalledTimes(0);
    expect(datadogLogs.logger.error).toHaveBeenCalledTimes(0);
    expect(consoleSpy).toHaveBeenCalledTimes(0);
  });

  it('should output an error log', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    logger.error('Foo bar');

    expect(datadogLogs.logger.error).toHaveBeenCalledWith('Foo bar', defaults);
    expect(datadogLogs.logger.log).toHaveBeenCalledTimes(0);
    expect(datadogLogs.logger.debug).toHaveBeenCalledTimes(0);
    expect(datadogLogs.logger.info).toHaveBeenCalledTimes(0);
    expect(datadogLogs.logger.warn).toHaveBeenCalledTimes(0);
    expect(consoleSpy).toHaveBeenCalledTimes(0);
  });
});
