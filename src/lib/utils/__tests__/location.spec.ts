import { getReferrer } from '@lib/utils/location';

describe('@utils/referrers', () => {
  let windowSpy: jest.SpyInstance;

  beforeEach(() => {
    windowSpy = jest.spyOn(window, 'window', 'get');
  });

  afterEach(() => {
    windowSpy.mockRestore();
  });

  it('should return a valid domain', () => {
    const output = getReferrer('https://www.foo.com');
    expect(output).toEqual('https://www.foo.com');
  });

  it('should return an existing ancestor origin', () => {
    windowSpy.mockImplementation(() => ({
      location: {
        ancestorOrigins: ['https://www.bar.com'],
      },
    }));
    const output = getReferrer('https://www.foo.com');
    expect(output).toEqual('https://www.bar.com');
  });

  it('should return a valid domain if ancestor is auth', () => {
    windowSpy.mockImplementation(() => ({
      location: {
        ancestorOrigins: ['https://auth.magic.link'],
      },
    }));
    const output = getReferrer('https://www.foo.com');
    expect(output).toEqual('https://www.foo.com');
  });

  it('should fallback to a "no-referrer" with invalid url', () => {
    const output = getReferrer('foo');
    expect(output).toEqual('https://no-referrer.magic.link');
  });

  it('should return empty string when window is undefined', () => {
    windowSpy.mockImplementation(() => undefined);

    const output = getReferrer('https://www.foo.com');
    expect(output).toEqual('');
  });
});
