import { serverLogger } from '../server-logger';

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
  uid: '',
  walletType: 'ETH',
};

jest.mock('winston', () => {
  const originalModule = jest.requireActual('winston');
  return {
    ...originalModule,
    createLogger: jest.fn(() => {
      return {
        log: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };
    }),
  };
});

describe('serverLogger', () => {
  const logger = serverLogger;

  beforeAll(() => {
    jest.resetModules(); // Reset cache
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should output an info log with additional data', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    logger.info('Foo bar', { foo: 'bar' }, defaults);

    expect(logger.info).toHaveBeenCalledWith('Foo bar', { foo: 'bar' }, defaults);
    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(logger.warn).toHaveBeenCalledTimes(0);
    expect(logger.error).toHaveBeenCalledTimes(0);
    expect(consoleSpy).toHaveBeenCalledTimes(0);
  });

  it('should output an info log', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    logger.info('Foo bar', defaults);

    expect(logger.info).toHaveBeenCalledWith('Foo bar', defaults);
    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(logger.warn).toHaveBeenCalledTimes(0);
    expect(logger.error).toHaveBeenCalledTimes(0);
    expect(consoleSpy).toHaveBeenCalledTimes(0);
  });

  it('should output a warn log', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    logger.warn('Foo bar', defaults);

    expect(logger.warn).toHaveBeenCalledWith('Foo bar', defaults);
    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledTimes(0);
    expect(logger.error).toHaveBeenCalledTimes(0);
    expect(consoleSpy).toHaveBeenCalledTimes(0);
  });

  it('should output an error log', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    logger.error('Foo bar', defaults);

    expect(logger.error).toHaveBeenCalledWith('Foo bar', defaults);
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.warn).toHaveBeenCalledTimes(0);
    expect(logger.info).toHaveBeenCalledTimes(0);
    expect(consoleSpy).toHaveBeenCalledTimes(0);
  });
});
