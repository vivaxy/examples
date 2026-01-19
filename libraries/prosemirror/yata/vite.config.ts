import { defineConfig } from 'vite';

export default defineConfig({
  // Build configuration
  build: {
    outDir: '.',
    emptyOutDir: false,
    sourcemap: true,
    rollupOptions: {
      output: {
        entryFileNames: 'bundle.js',
      },
    },
  },

  // Dev server configuration
  server: {
    open: true,
  },

  // Test configuration (Vitest)
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
        'vite.config.ts',
      ],
    },
    testTimeout: 10000,
  },
});
