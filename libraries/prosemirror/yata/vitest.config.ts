import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

export default defineConfig({
  plugins: [
    swc.vite({
      jsc: {
        parser: {
          syntax: 'typescript',
        },
        target: 'es2020',
      },
      module: {
        type: 'es6',
      },
    }),
  ],
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
