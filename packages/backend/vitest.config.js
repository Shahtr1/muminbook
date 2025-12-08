'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const config_1 = require('vitest/config');
const path_1 = __importDefault(require('path'));
exports.default = (0, config_1.defineConfig)({
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
        'copy-file.js',
        'src/data/**',
        'src/constants/**',
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
      '@': path_1.default.resolve(__dirname, './src'),
    },
  },
});
