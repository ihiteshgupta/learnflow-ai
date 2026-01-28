import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['src/**/*.integration.test.ts', 'node_modules'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/lib/**/*.ts', 'src/components/**/*.tsx'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.d.ts',
        'src/lib/db/schema/**',
      ],
      // Note: Coverage thresholds are set lower for v1 as UI components
      // don't have tests yet. Critical utilities (xp-calculator, streak-calculator,
      // rate-limit) have full test coverage.
      thresholds: {
        statements: 10,
        branches: 10,
        functions: 5,
        lines: 10,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
