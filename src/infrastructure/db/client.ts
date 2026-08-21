import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'
import { resolveDatabaseUrl } from '../config/env'

export type Database = NodePgDatabase<typeof schema>

/** A database handle or a transaction handle: repositories accept either. */
export type Executor = Database | Parameters<Parameters<Database['transaction']>[0]>[0]

interface DbHandle {
  pool: Pool
  db: Database
}

const globalForDb = globalThis as unknown as { __arkanDb?: DbHandle | undefined }

export function getDb(): Database {
  return getHandle().db
}

export function getPool(): Pool {
  return getHandle().pool
}

function getHandle(): DbHandle {
  if (!globalForDb.__arkanDb) {
    const pool = new Pool({ connectionString: resolveDatabaseUrl() })
    globalForDb.__arkanDb = { pool, db: drizzle(pool, { schema }) }
  }
  return globalForDb.__arkanDb
}

export async function closeDb(): Promise<void> {
  if (globalForDb.__arkanDb) {
    await globalForDb.__arkanDb.pool.end()
    globalForDb.__arkanDb = undefined
  }
}
