import { config } from 'dotenv'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { sql } from 'drizzle-orm'
import { closeDb, getDb } from '@/infrastructure/db/client'

config({ path: '.env', quiet: true })

if (process.env.NODE_ENV !== 'test') {
  throw new Error(
    'The test suite must run with NODE_ENV=test so it never touches the dev database.',
  )
}

/**
 * Tests run against a real PostgreSQL. The guarantees under test — append-only
 * facts, tenant-safe links, all-or-nothing operations — live in the database, so
 * a fake would be testing the fake.
 */
export async function setup(): Promise<void> {
  const db = getDb()
  await migrate(db, { migrationsFolder: './drizzle' })
  await db.execute(
    sql`truncate table fact_links, facts, access_grants, operations, businesses, users restart identity cascade`,
  )
}

export async function teardown(): Promise<void> {
  await closeDb()
}
