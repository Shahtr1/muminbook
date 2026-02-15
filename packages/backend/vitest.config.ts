import { defineConfig } from 'vitest/config';
import * as path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '*.config.ts',
        'src/index.ts',
        'copy-file.mjs',
        'src/data/**',
        'src/jobs/**',
        'src/models/**',
        'src/constants/**',
        'src/routes/**',
        'src/config/**',
        'dist/**',
        'scripts/**',
      ],
      thresholds: {
        lines: 50,
        functions: 50,
        branches: 50,
        statements: 50,
      },
    },
    include: ['src/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules/', 'dist/'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
