const fs = require('fs');
const murmur = require('murmurhash-js');
const { locales, pages, defaultLocale } = require('./i18n');

const defaultNamespace = 'common';

// Parse a key-value pair with a namespace
// Used by parseUseTranslationInstances and parseTransComponentInstances
const parseNsKeyPair = (parser, ns, key) => {
  const defaultKey = murmur.murmur3(key).toString();

  parser.set(defaultKey, {
    defaultValue: key,
    ns: ns ? ns : defaultNamespace,
  });
};

// Parse usage of `t` function from useTranslation hook
const parseUseTranslationInstances = (parser, content) => {
  // Parse calls to the `t` function from useTranslation
  let ns;
  if (content.includes('useTranslation')) {
    ns = content.split(/useTranslation\(['"]([^'"]+)['"]\)/)[1];
  }

  parser.parseFuncFromString(content, { list: ['t'], extensions: ['.ts', '.tsx'] }, key =>
    parseNsKeyPair(parser, ns, key),
  );
};

// Parse usage of T components
const parseTransComponentInstances = (parser, content) => {
  // Regular expression to match the rendering T component
  // (excludes components that start with 'T' like Text)
  const isolateRegex = /<T\b[^>]*>([\s\S]*?)<\/T>/g;

  let match;
  // Execute the regular expression repeatedly to find all matches
  while ((match = isolateRegex.exec(content)) !== null) {
    const ns = match[0].match(/ns="(.*?)"/)[1];
    const key = match[0].match(/translate="(.*?)"/)[1];
    parseNsKeyPair(parser, ns, key);
  }
};

module.exports = {
  input: ['src/**/*.{ts,tsx}', '!**/__mocks__/**', '!**/node_modules/**', '!**/__tests__/**'],
  options: {
    debug: true,
    lngs: locales,
    ns: Object.values(pages).flat(),
    defaultLng: defaultLocale,
    defaultNs: defaultNamespace,
    defaultValue: (lng, ns, key, { defaultValue }) => (lng === defaultLocale ? defaultValue : '__UNTRANSLATED__'),
    removeUnusedKeys: true,
    resource: {
      loadPath: './public/locales/{{lng}}/{{ns}}.json',
      savePath: './public/locales/{{lng}}/{{ns}}.json',
      jsonIndent: 2,
      lineEnding: '\n',
    },
    sort: true,
    nsSeparator: ':',
    keySeparator: '.',
    interpolation: {
      prefix: '{{',
      suffix: '}}',
    },
  },
  transform: function customTransform(file, enc, done) {
    'use strict';

    const content = fs.readFileSync(file.path, enc).toString();
    parseUseTranslationInstances(this.parser, content);
    parseTransComponentInstances(this.parser, content);
    done();
  },
};
