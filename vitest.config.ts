import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: { '@': resolve(import.meta.dirname, 'src') },
  },
  test: {
    environment: 'node',
    globals: false,
    include: ['tests/**/*.test.ts'],
    globalSetup: ['tests/support/global-setup.ts'],
    // One PostgreSQL database is shared by the suite: files run one at a time.
    fileParallelism: false,
    hookTimeout: 60_000,
    testTimeout: 30_000,
  },
})
