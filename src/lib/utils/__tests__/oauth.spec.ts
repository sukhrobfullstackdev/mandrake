import { OAuthProvider } from '@custom-types/oauth';
import {
  RedirectAllowlistError,
  checkRedirectAllowlist,
  normalizeOAuthScope,
  oauthScopeToArray,
  parseOAuthFields,
  popupStartParamsAreValid,
  redirectResultHasError,
} from '../oauth';

describe('@utils/oauth', () => {
  describe('oauthScopeToArray()', () => {
    const tests = [
      {
        assert: 'email profile',
        expected: ['email', 'profile'],
      },
      {
        assert: 'email profile email',
        expected: ['email', 'profile'],
      },
      {
        assert: 'openid https://www.googleapis.com/auth/userinfo.email',
        expected: ['openid', 'https://www.googleapis.com/auth/userinfo.email'],
      },
      {
        assert: '',
        expected: [],
      },
      {
        assert: undefined,
        expected: [],
      },
      {
        assert: [],
        expected: [],
      },
      {
        assert: ['email', 'profile'],
        expected: ['email', 'profile'],
      },
    ];

    tests.forEach(({ assert, expected }) => {
      it(`Given the params ${assert} should return ${expected}`, () => {
        expect(oauthScopeToArray(assert)).toEqual(expected);
      });
    });
  });

  describe('redirectResultHasError()', () => {
    const tests = [
      {
        assert: {
          error: 'oops',
          state: '12345',
        },
        expected: true,
      },
      {
        assert: {
          state: '12345',
        },
        expected: false,
      },
      {
        assert: {
          authError: 'oops',
          state: '12345',
        },
        expected: true,
      },
      {
        assert: {
          authError: '',
          state: '12345',
        },
        expected: false,
      },
      {
        assert: {},
        expected: false,
      },
    ];

    tests.forEach(({ assert, expected }) => {
      it(`Given the params ${assert} should return ${expected}`, () => {
        expect(redirectResultHasError(assert)).toBe(expected);
      });
    });
  }); // Update this with your module path

  describe('normalizeOAuthScope()', () => {
    const tests = [
      {
        input: 'email profile',
        expected: 'email profile',
      },
      {
        input: 'email profile email',
        expected: 'email profile',
      },
      {
        input: 'openid https://www.googleapis.com/auth/userinfo.email',
        expected: 'openid https://www.googleapis.com/auth/userinfo.email',
      },
      {
        input: '',
        expected: '',
      },
      {
        input: undefined,
        expected: '',
      },
      {
        input: ['email', 'profile'],
        expected: ['email', 'profile'],
      },
      {
        input: ['openid', 'https://www.googleapis.com/auth/userinfo.email'],
        expected: ['openid', 'https://www.googleapis.com/auth/userinfo.email'],
      },
      {
        input: ['email', 'profile', 'email'],
        expected: ['email', 'profile'],
      },
    ];

    tests.forEach(({ input, expected }) => {
      it(`should normalize "${input}" to ${JSON.stringify(expected)}`, () => {
        expect(normalizeOAuthScope(input as string)).toEqual(expected);
      });
    });
  });

  describe('parseOAuthFields()', () => {
    const tests = [
      {
        assert:
          'state=ggg999&code=123abc&scope=email+profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+openid&authuser=0&hd=magic.link&prompt=none',
        expected: {
          state: 'ggg999',
          authorizationCode: '123abc',
        },
      },
      {
        assert: '',
        expected: {},
      },
      {
        assert: 'state=ggg999&code=123abc&prompt=none',
        expected: {
          state: 'ggg999',
          authorizationCode: '123abc',
        },
      },
      {
        assert: 'state=ggg999&code=123abc',
        expected: {
          state: 'ggg999',
          authorizationCode: '123abc',
        },
      },
      {
        assert: 'state=ggg999&code=123abc&scope=&authuser=0&hd=magic.link&prompt=none',
        expected: {
          state: 'ggg999',
          authorizationCode: '123abc',
        },
      },
      {
        assert: 'state=ggg999&code=123abc&scope=email&authuser=0&hd=magic.link&prompt=none',
        expected: {
          state: 'ggg999',
          authorizationCode: '123abc',
        },
      },
      {
        assert:
          'state=ggg999&error=something_bad_happened&error_description=yikes&scope=email&authuser=0&hd=magic.link&prompt=none',
        expected: {
          state: 'ggg999',
          error: 'something_bad_happened',
          errorDescription: 'yikes',
        },
      },
      {
        assert: 'state=ggg999&code=123abc&scope=email&authuser=0&hd=magic.link&id_token=12345',
        expected: {
          state: 'ggg999',
          authorizationCode: '123abc',
          idToken: '12345',
        },
      },
      {
        assert: 'not_real=123&invalid=456&this_is_not_oauth=true',
        expected: {},
      },
      {
        assert:
          'projectId=702e2d45d9debca66795614cddb5c1ca&state=pjEg3P1DTvya5DMX82yj0wbi1WJmJVVYFhTmWZuTRZk1QOZ4yu-Gki~l7dpzfgMR2n07ai2N5Emcofk_CCI.~WlshpQ_O.RNRTMozrHDadVC~2Z8_WWX-w2sguLD0fni&code=4%2F0AcvDMrDbguPaivFG64IPgZ7kYszWKJBa2a17OZve9I2aWTV24MixZD7YrsdUF6QB5Yettg&scope=email%20profile%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email%20openid&authuser=0&prompt=none',
        expected: {
          state:
            'pjEg3P1DTvya5DMX82yj0wbi1WJmJVVYFhTmWZuTRZk1QOZ4yu-Gki~l7dpzfgMR2n07ai2N5Emcofk_CCI.~WlshpQ_O.RNRTMozrHDadVC~2Z8_WWX-w2sguLD0fni',
          authorizationCode: '4/0AcvDMrDbguPaivFG64IPgZ7kYszWKJBa2a17OZve9I2aWTV24MixZD7YrsdUF6QB5Yettg',
        },
      },
    ];

    tests.forEach(({ assert, expected }) => {
      it(`should parse the query string "${assert}" correctly`, () => {
        expect(parseOAuthFields(assert)).toEqual(expected);
      });
    });
  });

  describe('parseOAuthFields() with hash appended to state', () => {
    const tests = [
      {
        assert:
          'state=ggg999#_=_&code=123abc&scope=email+profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+openid&authuser=0&hd=magic.link&prompt=none',
        expected: {
          state: 'ggg999',
          authorizationCode: '123abc',
        },
      },
      {
        assert: '',
        expected: {},
      },
      {
        assert: 'state=ggg999#_=_&code=123abc&prompt=none',
        expected: {
          state: 'ggg999',
          authorizationCode: '123abc',
        },
      },
      {
        assert: 'state=ggg999#_=_&code=123abc',
        expected: {
          state: 'ggg999',
          authorizationCode: '123abc',
        },
      },
      {
        assert: 'state=ggg999#_=_&code=123abc&scope=&authuser=0&hd=magic.link&prompt=none',
        expected: {
          state: 'ggg999',
          authorizationCode: '123abc',
        },
      },
      {
        assert: 'state=ggg999#_=_&code=123abc&scope=email&authuser=0&hd=magic.link&prompt=none',
        expected: {
          state: 'ggg999',
          authorizationCode: '123abc',
        },
      },
      {
        assert:
          'state=ggg999#_=_&error=something_bad_happened&error_description=yikes&scope=email&authuser=0&hd=magic.link&prompt=none',
        expected: {
          state: 'ggg999',
          error: 'something_bad_happened',
          errorDescription: 'yikes',
        },
      },
      {
        assert: 'state=ggg999#_=_&code=123abc&scope=email&authuser=0&hd=magic.link&id_token=12345',
        expected: {
          state: 'ggg999',
          authorizationCode: '123abc',
          idToken: '12345',
        },
      },
      {
        assert: 'not_real=123&invalid=456&this_is_not_oauth=true',
        expected: {},
      },
      {
        assert:
          'projectId=702e2d45d9debca66795614cddb5c1ca&state=pjEg3P1DTvya5DMX82yj0wbi1WJmJVVYFhTmWZuTRZk1QOZ4yu-Gki~l7dpzfgMR2n07ai2N5Emcofk_CCI.~WlshpQ_O.RNRTMozrHDadVC~2Z8_WWX-w2sguLD0fni#_=_&code=4%2F0AcvDMrDbguPaivFG64IPgZ7kYszWKJBa2a17OZve9I2aWTV24MixZD7YrsdUF6QB5Yettg&scope=email%20profile%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email%20openid&authuser=0&prompt=none',
        expected: {
          state:
            'pjEg3P1DTvya5DMX82yj0wbi1WJmJVVYFhTmWZuTRZk1QOZ4yu-Gki~l7dpzfgMR2n07ai2N5Emcofk_CCI.~WlshpQ_O.RNRTMozrHDadVC~2Z8_WWX-w2sguLD0fni',
          authorizationCode: '4/0AcvDMrDbguPaivFG64IPgZ7kYszWKJBa2a17OZve9I2aWTV24MixZD7YrsdUF6QB5Yettg',
        },
      },
    ];

    tests.forEach(({ assert, expected }) => {
      it(`should parse the query string "${assert}" correctly`, () => {
        expect(parseOAuthFields(assert)).toEqual(expected);
      });
    });
  });

  describe('popupStartParamsAreValid()', () => {
    const tests = [
      {
        params: {
          oauthId: 'id123',
          oauthAppId: 'app123',
          oauthAppRedirectId: 'redirect123',
        },
        provider: 'google',
        expected: true,
      },
      {
        params: {
          oauthId: 'id123',
          oauthAppId: 'app123',
          oauthAppRedirectId: 'redirect123',
        },
        provider: 'linkedin',
        expected: true,
      },
      {
        params: {
          oauthId: 'id123',
          oauthAppId: 'app123',
          oauthAppRedirectId: 'redirect123',
        },
        provider: 'github',
        expected: true,
      },
      {
        params: {
          oauthId: 'id123',
          oauthAppId: 'app123',
          oauthAppRedirectId: 'redirect123',
        },
        provider: 'gitlab',
        expected: true,
      },
      {
        params: {
          oauthId: 'id123',
          oauthAppId: 'app123',
          oauthAppRedirectId: 'redirect123',
        },
        provider: 'bitbucket',
        expected: true,
      },
      {
        params: {
          oauthId: 'id123',
          oauthAppId: 'app123',
          oauthAppRedirectId: 'redirect123',
        },
        provider: 'facebook',
        expected: true,
      },
      {
        params: {
          oauthId: 'id123',
          oauthAppId: 'app123',
          oauthAppRedirectId: 'redirect123',
        },
        provider: 'twitter',
        expected: true,
      },
      {
        params: {
          oauthId: 'id123',
          oauthAppId: 'app123',
          oauthAppRedirectId: 'redirect123',
        },
        provider: 'apple',
        expected: true,
      },
      {
        params: {
          oauthId: 'id123',
          oauthAppId: 'app123',
          // oauthAppRedirectId is missing intentionally to make the test fail
        },
        provider: 'google',
        expected: false,
      },
      {
        params: {
          oauthId: 'id123',
          oauthAppId: 'app123',
          oauthAppRedirectId: 'redirect123',
        },
        provider: 'not_a_valid_provider',
        expected: false,
      },
      {
        params: {
          oauthId: 'id123',
          oauthAppId: 'app123',
          oauthAppRedirectId: 'redirect123',
        },
        provider: undefined,
        expected: false,
      },
    ];

    tests.forEach(({ params, provider, expected }) => {
      it(`should return ${expected} for params: ${JSON.stringify(params)} and provider: ${provider}`, () => {
        expect(popupStartParamsAreValid(params, provider as OAuthProvider)).toEqual(expected);
      });
    });
  });

  describe('checkRedirectAllowlist', () => {
    it('should validate a URL that matches exactly ', () => {
      const redirectUrl = 'https://relayer-test-kitcen.vercel.app/redirect';
      const redirectAllowList = ['https://relayer-test-kitcen.vercel.app/redirect'];
      const isRequired = false;

      const expected = { redirectUrlIsValid: true };

      const actual = checkRedirectAllowlist({
        redirectUrl,
        redirectAllowList,
        isRequired,
      });

      expect(actual).toEqual(expected);
    });

    it('should validate a URL that matches a wildcard domain (type A)', () => {
      const redirectUrl = 'https://relayer-test-kitcen.vercel.app/redirect';
      const redirectAllowList = ['https://*.vercel.app/redirect'];
      const isRequired = false;

      const expected = { redirectUrlIsValid: true };

      const actual = checkRedirectAllowlist({
        redirectUrl,
        redirectAllowList,
        isRequired,
      });

      expect(actual).toEqual(expected);
    });

    it('should validate a URL that matches a wildcard subdomain', () => {
      const redirectUrl = 'https://relayer-test-kitcen.vercel.app/redirect';
      const redirectAllowList = ['https://relayer-test-kitcen.*.app/redirect'];
      const isRequired = true;

      const expected = {
        redirectUrlIsValid: true,
      };

      const actual = checkRedirectAllowlist({
        redirectUrl,
        redirectAllowList,
        isRequired,
      });

      expect(actual).toEqual(expected);
    });

    it('should validate a URL that matches a wildcard TLD', () => {
      const redirectUrl = 'https://relayer-test-kitcen.vercel.app/redirect';
      const redirectAllowList = ['https://relayer-test-kitcen.vercel.*/redirect'];
      const isRequired = true;

      const expected = { redirectUrlIsValid: true };

      const actual = checkRedirectAllowlist({
        redirectUrl,
        redirectAllowList,
        isRequired,
      });

      expect(actual).toEqual(expected);
    });

    it('should validate a URL that matches a wildcard path', () => {
      const redirectUrl = 'https://relayer-test-kitcen.vercel.app/redirect';
      const redirectAllowList = ['https://relayer-test-kitcen.vercel.app/*'];
      const isRequired = true;

      const expected = { redirectUrlIsValid: true };

      const actual = checkRedirectAllowlist({
        redirectUrl,
        redirectAllowList,
        isRequired,
      });

      expect(actual).toEqual(expected);
    });

    it('should validate a URL that matches a double wildcard', () => {
      const redirectUrl = 'https://relayer-test-kitcen.vercel.app/redirect';
      const redirectAllowList = ['https://*/*'];
      const isRequired = true;

      const expected = { redirectUrlIsValid: true };

      const actual = checkRedirectAllowlist({
        redirectUrl,
        redirectAllowList,
        isRequired,
      });

      expect(actual).toEqual(expected);
    });

    it('should validate a URL with a trailing slash when the allow list does not have one', () => {
      const redirectUrl = 'https://relayer-test-kitcen.vercel.app/';
      const redirectAllowList = ['https://relayer-test-kitcen.vercel.app'];
      const isRequired = true;

      const expected = { redirectUrlIsValid: true };

      const actual = checkRedirectAllowlist({
        redirectUrl,
        redirectAllowList,
        isRequired,
      });

      expect(actual).toEqual(expected);
    });

    it('should validate a URL without a trailing slash when the allow list has one', () => {
      const redirectUrl = 'https://relayer-test-kitcen.vercel.app';
      const redirectAllowList = ['https://relayer-test-kitcen.vercel.app/'];
      const isRequired = true;

      const expected = { redirectUrlIsValid: true };

      const actual = checkRedirectAllowlist({
        redirectUrl,
        redirectAllowList,
        isRequired,
      });

      expect(actual).toEqual(expected);
    });

    it('should validate that any port on localhost is allowed in the redirect URL when it is required', () => {
      const redirectUrl = 'http://localhost:3014';
      const redirectAllowList = ['http://localhost', 'https://magic-facaster.vercel.app'];
      const isRequired = true;

      const expected = {
        redirectUrlIsValid: true,
      };

      const actual = checkRedirectAllowlist({
        redirectUrl,
        redirectAllowList,
        isRequired,
      });

      expect(actual).toEqual(expected);
    });

    it('should return RedirectAllowlistError.MISMATCH for a mismatched URL', () => {
      const redirectUrl = 'https://relayer-test-kitcen.vercel.app/redirect';
      const redirectAllowList = ['https://relayer-test-hello-kitcen.vercel.app/redirect'];
      const isRequired = true;

      const expected = {
        redirectUrlIsValid: false,
        redirectUrlError: RedirectAllowlistError.MISMATCH,
      };

      const actual = checkRedirectAllowlist({
        redirectUrl,
        redirectAllowList,
        isRequired,
      });

      expect(actual).toEqual(expected);
    });

    it('should return RedirectAllowlistError.EMPTY for an empty allowlist', () => {
      const redirectUrl = 'https://relayer-test-kitcen.vercel.app/redirect';
      const redirectAllowList: string[] = [];
      const isRequired = true;

      const expected = {
        redirectUrlIsValid: false,
        redirectUrlError: RedirectAllowlistError.EMPTY,
      };

      const actual = checkRedirectAllowlist({
        redirectUrl,
        redirectAllowList,
        isRequired,
      });

      expect(actual).toEqual(expected);
    });
  });
});
