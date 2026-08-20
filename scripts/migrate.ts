import { config } from 'dotenv'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { closeDb, getDb } from '../src/infrastructure/db/client'

config({ path: '.env', quiet: true })

async function main(): Promise<void> {
  await migrate(getDb(), { migrationsFolder: './drizzle' })
  console.log('migrations applied')
  await closeDb()
}

main().catch(async (error: unknown) => {
  console.error(error)
  await closeDb()
  process.exit(1)
})
