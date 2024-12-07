module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', ['arch', 'core', 'libs', 'misc', 'ui', 'wip']],
  },
};
