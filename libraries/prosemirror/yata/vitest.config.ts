import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
    environment: 'node',
    globals: true,
    alias: {
      '^(\\.{1,2}/.+)\\.js$': '$1.ts',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '**/__tests__/**',
        '**/integration-test/**',
        'webpack.config.js',
      ],
    },
    testTimeout: 10000,
  },
});
