import type { JsonValue } from '@/domain/shared/json'
import type { BusinessId, OperationId } from '@/domain/shared/ids'
import type { AccessGrantRepository, BusinessRepository, UserRepository } from './repositories'
import type { FactWriter } from './fact-ledger'

/**
 * Everything a use case can touch inside one transaction. A repository handed out
 * here writes through the same connection as every other one, so the whole
 * operation commits together or not at all.
 */
export interface TransactionContext {
  readonly operationId: OperationId
  readonly businesses: BusinessRepository
  readonly users: UserRepository
  readonly accessGrants: AccessGrantRepository
  readonly facts: FactWriter
}

/**
 * The declaration of an operation.
 *
 * `idempotencyKey` is the caller's promise: "this is the same attempt as before".
 * Two runs with the same business and key produce the consequences once — the
 * second one replays the stored outcome instead of writing a second movement, a
 * second charge or a second fact.
 */
export interface OperationCommand {
  /**
   * The scope the idempotency key belongs to. `null` for operations that run
   * before their business exists (registering a business) or outside any business
   * (registering a user); those keys must be globally unique — use a UUID.
   */
  readonly businessId: BusinessId | null
  readonly type: string
  readonly idempotencyKey: string
}

export interface OperationOutcome<T extends JsonValue> {
  readonly operationId: OperationId
  /** True when the operation had already been executed and nothing was rewritten. */
  readonly replayed: boolean
  readonly result: T
}

export interface UnitOfWork {
  run<T extends JsonValue>(
    command: OperationCommand,
    work: (tx: TransactionContext) => Promise<T>,
  ): Promise<OperationOutcome<T>>
}

/** Read-only access, outside any transaction. */
export interface ReadContext {
  readonly businesses: BusinessRepository
  readonly users: UserRepository
  readonly accessGrants: AccessGrantRepository
}
