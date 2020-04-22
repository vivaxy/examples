/**
 * @since 2020-04-22 20:29
 * @author vivaxy
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [0, 'always', 100],
  },
};
