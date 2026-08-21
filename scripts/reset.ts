import { config } from 'dotenv'
import { sql } from 'drizzle-orm'
import { closeDb, getDb } from '../src/infrastructure/db/client'

config({ path: '.env', quiet: true })

/**
 * Development helper: empties every table. Facts are append-only for the
 * application, so this uses TRUNCATE, which the row triggers do not intercept —
 * it exists to reset a local database, never as a domain operation.
 */
async function main(): Promise<void> {
  await getDb().execute(
    sql`truncate table fact_links, facts, access_grants, operations, businesses, users restart identity cascade`,
  )
  console.log('database emptied')
  await closeDb()
}

main().catch(async (error: unknown) => {
  console.error(error)
  await closeDb()
  process.exit(1)
})
