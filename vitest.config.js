import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules',
        'test/**',
        '**/*.config.js',
        'benchmarks/**',
        'glue.min.js'
      ]
    },
    include: ['test/**/*.test.js'],
    testTimeout: 10000
  }
});