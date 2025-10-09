import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['tests/**', 'node_modules/**', '.next/**', 'dist/**'],
    passWithNoTests: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
