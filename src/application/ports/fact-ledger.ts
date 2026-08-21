import type { Fact, FactDraft } from '@/domain/facts/fact'
import type { EntityRef } from '@/domain/facts/entity-ref'
import type { BusinessId, FactId, OperationId } from '@/domain/shared/ids'

/**
 * The write side of the Libro de Hechos. It is the only way a fact enters the
 * system, and it exists only inside a transaction.
 */
export interface FactWriter {
  append(input: { businessId: BusinessId; draft: FactDraft }): Promise<Fact>
}

export interface FactPage {
  readonly facts: Fact[]
  readonly nextCursor: FactCursor | null
}

/** Keyset cursor: facts are ordered by fecha del hecho, then by ledger sequence. */
export interface FactCursor {
  readonly occurredAt: string
  readonly seq: number
}

export interface FactQueryOptions {
  readonly limit?: number
  readonly cursor?: FactCursor | null
}

/**
 * The read side. Every context — recent activity, an entity's history, an
 * operation's facts — reads the same rows; no context owns a copy.
 */
export interface FactReader {
  recentActivity(businessId: BusinessId, options?: FactQueryOptions): Promise<FactPage>
  entityHistory(
    businessId: BusinessId,
    entity: EntityRef,
    options?: FactQueryOptions,
  ): Promise<FactPage>
  byId(businessId: BusinessId, id: FactId): Promise<Fact | null>
  byOperation(businessId: BusinessId, operationId: OperationId): Promise<Fact[]>
}
