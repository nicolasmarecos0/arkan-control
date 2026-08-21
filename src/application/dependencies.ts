import type { Clock } from './ports/clock'
import type { FactReader } from './ports/fact-ledger'
import type { IdGenerator } from './ports/id-generator'
import type { ReadContext, UnitOfWork } from './ports/unit-of-work'

/** Everything the application layer needs, all of it behind a port. */
export interface AppDependencies {
  readonly unitOfWork: UnitOfWork
  readonly clock: Clock
  readonly ids: IdGenerator
  readonly read: ReadContext
  readonly facts: FactReader
}
