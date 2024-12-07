import '@testing-library/jest-dom';
import 'jest-canvas-mock';
import failOnConsole from 'jest-fail-on-console';
import { StateCreator, StoreApi } from 'zustand';
import { PersistOptions, createJSONStorage } from 'zustand/middleware';

failOnConsole();

jest.useFakeTimers();

// mocking react's cache function due to jest not finding it
jest.mock('react', () => {
  const testCache = <T extends (...args: Array<unknown>) => unknown>(func: T) => func;
  const originalModule = jest.requireActual('react');
  return {
    ...originalModule,
    cache: testCache,
  };
});

jest.mock('@launchdarkly/node-server-sdk', () => ({
  init: jest.fn(),
  logger: jest.fn(),
}));

jest.mock('@ht-sdks/events-sdk-js-browser', () => ({
  init: jest.fn(),
  page: jest.fn(),
  load: jest.fn(),
  track: jest.fn(),
  HtEventsBrowser: {
    load: jest.fn().mockReturnValue({
      identify: jest.fn(),
      page: jest.fn(),
      track: jest.fn(),
    }),
    track: jest.fn(),
  },
}));

global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

declare global {
  var logger: any;
  var monitoring: any;
  interface Window {
    grecaptcha: {
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
      ready: (callback: () => void) => void;
    };
  }
}

beforeAll(() => {
  const mockValue = {
    data: 'foo',
    message: 'bar',
    status: 'ok',
    headers: {},
    statusCode: 200,
  };

  const mockResponse = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve(mockValue),
      clone: () => mockResponse,
      text: () => Promise.resolve('foo'),
      ok: true,
    }),
  );

  // @ts-expect-error no need to exhaustively type mock
  global.fetch = mockResponse;

  globalThis.logger = {
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
  globalThis.monitoring = {
    addError: jest.fn(),
  };

  // Ensure window.crypto and its subtle property are mocked
  if (typeof window !== 'undefined') {
    if (!window.crypto) {
      window.crypto = {} as any;
    }
    Object.assign(window.crypto, {
      subtle: {
        encrypt: jest.fn(),
        decrypt: jest.fn(),
        sign: jest.fn().mockReturnValue(Promise.resolve('test signature')),
        verify: jest.fn(),
        deriveBits: jest.fn(),
        deriveKey: jest.fn(),
        digest: jest.fn(),
        exportKey: jest.fn(),
        generateKey: jest.fn(),
        importKey: jest.fn(),
        wrapKey: jest.fn(),
        unwrapKey: jest.fn(),
      },
      getRandomValues: jest.fn().mockImplementation(array => array.fill(0)),
      randomUUID: jest.fn().mockReturnValue('123e4567-e89b-12d3-a456-426614174000'),
    });
    if (!window.grecaptcha) {
      window.grecaptcha = {} as any;
    }
    Object.assign(window.grecaptcha, {
      execute: jest.fn(() => Promise.resolve('asdf')),
      ready: jest.fn(callback => callback()),
    });
  }
});

// Mock the persist middleware to avoid storage access issues in unit tests
jest.mock('zustand/middleware', () => {
  const actualZustandMiddleware = jest.requireActual('zustand/middleware');

  return {
    ...actualZustandMiddleware,
    persist:
      <T extends object>(config: StateCreator<T>, options: PersistOptions<T>): StateCreator<T> =>
      (set: StoreApi<T>['setState'], get: StoreApi<T>['getState'], api: StoreApi<T>) => {
        // Bypass actual storage and just use the state directly
        const mockStorage = {
          getItem: jest.fn(),
          setItem: jest.fn(),
          removeItem: jest.fn(),
        };

        return actualZustandMiddleware.persist(config, {
          ...options,
          storage: createJSONStorage(() => mockStorage),
        })(set, get, api);
      },
  };
});

afterAll(() => {
  jest.restoreAllMocks();
});
