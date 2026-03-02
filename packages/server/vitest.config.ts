import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@nba-gm/shared': path.resolve(__dirname, '../shared/src/index.ts'),
    },
  },
  test: {
    passWithNoTests: true,
  },
});
