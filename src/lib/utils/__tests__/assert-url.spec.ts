import { MGBOX_API_URL, REVEAL_MAGIC_URL } from '@constants/env';
import { assertURLWithDomainAllowlist } from '@lib/utils/assert-url';

const wwwTrollGoatDotIO = 'https://www.trollgoat.io';
const WildCardTrollGoatDotIO = 'https://*.trollgoat.io';
const TrollGoatDotIO = 'https://trollgoat.io';
const subDomainTrollGoatDotIO = 'https://subdomain.trollgoat.io';
const MAGIC_LINK_URL = 'https://magic.link';
const domainAllowlistWildcard = [MAGIC_LINK_URL, WildCardTrollGoatDotIO];
const domainAllowlistWithWWW = [MAGIC_LINK_URL, wwwTrollGoatDotIO];
const domainAllowlistWithNoSub = [MAGIC_LINK_URL, TrollGoatDotIO];

/**
 * wildcard checks
 */
test('Returns true when allowlist domain has a wildcard', () => {
  expect(assertURLWithDomainAllowlist(domainAllowlistWildcard, wwwTrollGoatDotIO)).toBe(true);
});

test('Returns true when trying to match a trailing /', () => {
  expect(assertURLWithDomainAllowlist(domainAllowlistWildcard, `${wwwTrollGoatDotIO}/`)).toBe(true);
});

test('Returns true with wildcard but no subdomain', () => {
  expect(assertURLWithDomainAllowlist(domainAllowlistWildcard, TrollGoatDotIO)).toBe(true);
});

test('Returns false when wildcard trying to match 2 subdomains', () => {
  expect(assertURLWithDomainAllowlist(domainAllowlistWildcard, 'https://sub.sub.trollgoat.io')).toBe(false);
});

/**
 * www checks
 */
test('Returns true when trailing /', () => {
  expect(assertURLWithDomainAllowlist(domainAllowlistWithWWW, `${wwwTrollGoatDotIO}/`)).toBe(true);
});

test('Returns true when url is missing www', () => {
  expect(assertURLWithDomainAllowlist(domainAllowlistWithWWW, TrollGoatDotIO)).toBe(true);
});

test('Returns true when url is  exactly matching', () => {
  expect(assertURLWithDomainAllowlist(domainAllowlistWithWWW, wwwTrollGoatDotIO)).toBe(true);
});

/**
 * No SubDomain checks
 */
test('Returns true when url has www', () => {
  expect(assertURLWithDomainAllowlist(domainAllowlistWithNoSub, wwwTrollGoatDotIO)).toBe(true);
});

test('Returns false when url has extra w', () => {
  expect(assertURLWithDomainAllowlist(domainAllowlistWithNoSub, 'https://wwww.trollgoat.io')).toBe(false);
});

/**
 * Misc
 */
test('Returns true when trying to match a trailing /', () => {
  expect(assertURLWithDomainAllowlist([MAGIC_LINK_URL, `${wwwTrollGoatDotIO}/`], wwwTrollGoatDotIO)).toBe(true);
});

test('Returns true with shorter path', () => {
  expect(assertURLWithDomainAllowlist([`${wwwTrollGoatDotIO}/path/to/source`], `${wwwTrollGoatDotIO}/path/to`)).toBe(
    true,
  );
});

test('Returns true with longer path', () => {
  expect(assertURLWithDomainAllowlist([`${wwwTrollGoatDotIO}/path/to`], `${wwwTrollGoatDotIO}/path/to/source`)).toBe(
    true,
  );
});
test('Returns true with mismatch path', () => {
  expect(assertURLWithDomainAllowlist([`${wwwTrollGoatDotIO}/abc/`], `${wwwTrollGoatDotIO}/xyz`)).toBe(true);
});

test('Returns true with query', () => {
  expect(assertURLWithDomainAllowlist([wwwTrollGoatDotIO], `${wwwTrollGoatDotIO}/?query=1`)).toBe(true);
});

test('Returns true with port', () => {
  expect(assertURLWithDomainAllowlist([MAGIC_LINK_URL, 'http://localhost'], 'http://localhost:3014')).toBe(true);
});

test('Returns true with TLD', () => {
  expect(
    assertURLWithDomainAllowlist([MAGIC_LINK_URL, `${WildCardTrollGoatDotIO}.us`], `${subDomainTrollGoatDotIO}.us`),
  ).toBe(true);
});

/**
 * Bypass
 */
test('Returns true when url is reveal.magic.link', () => {
  expect(assertURLWithDomainAllowlist(domainAllowlistWithNoSub, REVEAL_MAGIC_URL)).toBe(true);
});

test('Returns true when url is box.magic.link', () => {
  expect(assertURLWithDomainAllowlist(domainAllowlistWildcard, MGBOX_API_URL)).toBe(true);
});

test('Returns true when localhost', () => {
  expect(assertURLWithDomainAllowlist(domainAllowlistWildcard, 'http://localhost:3000')).toBe(true);
});

/**
 * Falsy
 */
test('Returns false when scheme mismatch', () => {
  expect(assertURLWithDomainAllowlist(domainAllowlistWildcard, 'http://www.trollgoat.io')).toBe(false);
});

test('Returns false when mismatch in domain name', () => {
  expect(assertURLWithDomainAllowlist(domainAllowlistWildcard, 'https://www.troiigoat.io')).toBe(false);
});

test('Returns false when not localhost', () => {
  expect(assertURLWithDomainAllowlist(domainAllowlistWildcard, 'https://localhost1')).toBe(false);
});

test('Returns false when invalid URL', () => {
  expect(assertURLWithDomainAllowlist([MAGIC_LINK_URL, `${WildCardTrollGoatDotIO}/path/to`], 'helloworld')).toBe(false);
});

test('empty string returns false', () => {
  expect(assertURLWithDomainAllowlist(domainAllowlistWildcard, '')).toBe(false);
});

test('https://comissionamento.splitc.com.br', () => {
  const allowlist = ['https://*.splitc.com.br', 'https://splitc.com.br'];

  expect(assertURLWithDomainAllowlist(allowlist, 'https://comissionamento.splitc.com.br')).toBe(true);
});
