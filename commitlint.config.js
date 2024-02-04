/**
 * @since 2020-04-22 20:29
 * @author vivaxy
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [0, 'always', 100],
  },
};
