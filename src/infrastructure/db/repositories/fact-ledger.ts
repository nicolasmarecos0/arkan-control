import { and, desc, eq, inArray, sql } from 'drizzle-orm'
import type {
  FactPage,
  FactQueryOptions,
  FactReader,
  FactWriter,
} from '@/application/ports/fact-ledger'
import type { EntityRef, EntityType } from '@/domain/facts/entity-ref'
import {
  factLinks as buildFactLinks,
  recordFact,
  type Fact,
  type FactDraft,
} from '@/domain/facts/fact'
import type { BusinessId, FactId, OperationId } from '@/domain/shared/ids'
import type { IdGenerator } from '@/application/ports/id-generator'
import type { Executor } from '../client'
import { toFact } from '../mappers'
import { factLinks, facts, type FactRow } from '../schema'

const DEFAULT_LIMIT = 25

/**
 * The single writer of the Libro de Hechos.
 *
 * It writes the fact once and its links once. The links are what make the fact
 * reachable from every context; nothing duplicates the fact itself.
 */
export class DrizzleFactWriter implements FactWriter {
  constructor(
    private readonly db: Executor,
    private readonly ids: IdGenerator,
    private readonly operationId: OperationId | null,
  ) {}

  async append(input: { businessId: BusinessId; draft: FactDraft }): Promise<Fact> {
    const fact = recordFact({
      id: this.ids.factId(),
      businessId: input.businessId,
      operationId: this.operationId,
      draft: input.draft,
    })

    await this.db.insert(facts).values({
      id: fact.id,
      businessId: fact.businessId,
      type: fact.type,
      occurredAt: fact.occurredAt,
      recordedAt: fact.recordedAt,
      actorType: fact.actor.actorType,
      actorId: fact.actor.actorId,
      actorLabel: fact.actor.actorLabel,
      origin: fact.origin,
      primaryEntityType: fact.primaryEntity.entityType,
      primaryEntityId: fact.primaryEntity.entityId,
      summary: fact.summary,
      consequences: fact.consequences,
      metadata: fact.metadata,
      operationId: fact.operationId,
    })

    const links = buildFactLinks(fact).map((link) => ({
      factId: fact.id,
      businessId: fact.businessId,
      entityType: link.entityType,
      entityId: link.entityId,
      role: link.role,
    }))
    await this.db.insert(factLinks).values(links)

    return fact
  }
}

/**
 * The single reader. Recent activity and contextual history are two filters over
 * the same rows — there is no per-module history table to keep in sync.
 */
export class DrizzleFactReader implements FactReader {
  constructor(private readonly db: Executor) {}

  async recentActivity(businessId: BusinessId, options: FactQueryOptions = {}): Promise<FactPage> {
    const limit = options.limit ?? DEFAULT_LIMIT
    const rows = await this.db
      .select()
      .from(facts)
      .where(and(eq(facts.businessId, businessId), beforeCursor(options)))
      .orderBy(desc(facts.occurredAt), desc(facts.seq))
      .limit(limit + 1)
    return this.toPage(rows, limit)
  }

  async entityHistory(
    businessId: BusinessId,
    entity: EntityRef,
    options: FactQueryOptions = {},
  ): Promise<FactPage> {
    const limit = options.limit ?? DEFAULT_LIMIT
    const rows = await this.db
      .select({ fact: facts })
      .from(facts)
      .innerJoin(
        factLinks,
        and(eq(factLinks.factId, facts.id), eq(factLinks.businessId, facts.businessId)),
      )
      .where(
        and(
          eq(facts.businessId, businessId),
          eq(factLinks.businessId, businessId),
          eq(factLinks.entityType, entity.entityType),
          eq(factLinks.entityId, entity.entityId),
          beforeCursor(options),
        ),
      )
      .orderBy(desc(facts.occurredAt), desc(facts.seq))
      .limit(limit + 1)
    return this.toPage(
      rows.map((row) => row.fact),
      limit,
    )
  }

  async byId(businessId: BusinessId, id: FactId): Promise<Fact | null> {
    const [row] = await this.db
      .select()
      .from(facts)
      .where(and(eq(facts.businessId, businessId), eq(facts.id, id)))
      .limit(1)
    if (!row) return null
    const related = await this.relatedByFact([row.id])
    return toFact(row, related.get(row.id) ?? [])
  }

  async byOperation(businessId: BusinessId, operationId: OperationId): Promise<Fact[]> {
    const rows = await this.db
      .select()
      .from(facts)
      .where(and(eq(facts.businessId, businessId), eq(facts.operationId, operationId)))
      .orderBy(facts.occurredAt, facts.seq)
    const related = await this.relatedByFact(rows.map((row) => row.id))
    return rows.map((row) => toFact(row, related.get(row.id) ?? []))
  }

  private async toPage(rows: FactRow[], limit: number): Promise<FactPage> {
    const page = rows.slice(0, limit)
    const related = await this.relatedByFact(page.map((row) => row.id))
    const factsPage = page.map((row) => toFact(row, related.get(row.id) ?? []))
    const last = page.at(-1)
    const nextCursor =
      rows.length > limit && last
        ? { occurredAt: last.occurredAt.toISOString(), seq: last.seq }
        : null
    return { facts: factsPage, nextCursor }
  }

  private async relatedByFact(
    ids: string[],
  ): Promise<Map<string, { entityType: EntityType; entityId: string }[]>> {
    const grouped = new Map<string, { entityType: EntityType; entityId: string }[]>()
    if (ids.length === 0) return grouped
    const rows = await this.db
      .select()
      .from(factLinks)
      .where(and(inArray(factLinks.factId, ids), eq(factLinks.role, 'RELACIONADA')))
      .orderBy(factLinks.entityType, factLinks.entityId)
    for (const row of rows) {
      const list = grouped.get(row.factId) ?? []
      list.push({ entityType: row.entityType as EntityType, entityId: row.entityId })
      grouped.set(row.factId, list)
    }
    return grouped
  }
}

function beforeCursor(options: FactQueryOptions) {
  const cursor = options.cursor
  if (!cursor) return undefined
  return sql`(${facts.occurredAt}, ${facts.seq}) < (${cursor.occurredAt}::timestamptz, ${cursor.seq}::bigint)`
}
