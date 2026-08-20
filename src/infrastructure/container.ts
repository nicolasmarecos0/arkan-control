import type { AppDependencies } from '@/application/dependencies'
import type { Clock } from '@/application/ports/clock'
import type { IdGenerator } from '@/application/ports/id-generator'
import { getDb, type Database } from './db/client'
import { DrizzleAccessGrantRepository } from './db/repositories/access-grant-repository'
import { DrizzleBusinessRepository } from './db/repositories/business-repository'
import { DrizzleFactReader } from './db/repositories/fact-ledger'
import { DrizzleUserRepository } from './db/repositories/user-repository'
import { DrizzleUnitOfWork } from './db/unit-of-work'
import { SystemClock } from './system/clock'
import { UuidGenerator } from './system/id-generator'

/**
 * Composition root. This is the only place where the application layer meets a
 * concrete driver; everything above it depends on ports.
 */
export function createAppDependencies(
  overrides: { db?: Database; clock?: Clock; ids?: IdGenerator } = {},
): AppDependencies {
  const db = overrides.db ?? getDb()
  const clock = overrides.clock ?? new SystemClock()
  const ids = overrides.ids ?? new UuidGenerator()

  return {
    unitOfWork: new DrizzleUnitOfWork(db, ids),
    clock,
    ids,
    read: {
      businesses: new DrizzleBusinessRepository(db),
      users: new DrizzleUserRepository(db),
      accessGrants: new DrizzleAccessGrantRepository(db),
    },
    facts: new DrizzleFactReader(db),
  }
}
