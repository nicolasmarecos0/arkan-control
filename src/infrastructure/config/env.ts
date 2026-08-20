import { z } from 'zod'

/**
 * Default connection used by `npm test`. Tests always run against a real
 * PostgreSQL: the Libro de Hechos guarantees (append-only, tenant-safe links,
 * transactional consequences) are enforced by the database, so an in-memory
 * double would prove nothing.
 */
export const DEFAULT_TEST_DATABASE_URL =
  'postgres://postgres:postgres@127.0.0.1:5432/arkan_control_test'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1).optional(),
  TEST_DATABASE_URL: z.string().min(1).optional(),
})

export type AppEnv = z.infer<typeof envSchema>

export function readEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
  return envSchema.parse({
    NODE_ENV: source.NODE_ENV,
    DATABASE_URL: source.DATABASE_URL,
    TEST_DATABASE_URL: source.TEST_DATABASE_URL,
  })
}

export function resolveDatabaseUrl(source: NodeJS.ProcessEnv = process.env): string {
  const env = readEnv(source)
  if (env.NODE_ENV === 'test') {
    return env.TEST_DATABASE_URL ?? DEFAULT_TEST_DATABASE_URL
  }
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Copy .env.example to .env and fill it in.')
  }
  return env.DATABASE_URL
}
