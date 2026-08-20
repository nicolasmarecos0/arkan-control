import { defineConfig } from 'drizzle-kit'
import { config } from 'dotenv'
import { resolveDatabaseUrl } from './src/infrastructure/config/env'

config({ path: '.env', quiet: true })

export default defineConfig({
  schema: './src/infrastructure/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: resolveDatabaseUrl() },
  strict: true,
  verbose: true,
})
