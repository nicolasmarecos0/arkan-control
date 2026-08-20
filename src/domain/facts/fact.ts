import { z } from 'zod'
import type { BusinessId, FactId, OperationId } from '../shared/ids'
import type { JsonObject } from '../shared/json'
import { jsonObjectSchema } from '../shared/json'
import { actorSchema, factOriginSchema, type Actor, type FactOrigin } from './actor'
import { consequenceSchema, type Consequence } from './consequence'
import { entityRefKey, entityRefSchema, sameEntity, type EntityRef } from './entity-ref'
import { factTypeSchema, type FactType } from './fact-type'
import { instantSchema, type TemporalStamp } from '../time/time'

/**
 * Libro de Hechos — a fact.
 *
 * One fact is written once (D9) and read from many contexts (D10). It is not a
 * per-module history row: the same record is what recent activity shows, what a
 * client's history shows and what a sale's history shows. The contexts come from
 * its links, not from copies.
 */
export interface Fact extends TemporalStamp {
  readonly id: FactId
  readonly businessId: BusinessId
  readonly type: FactType
  readonly actor: Actor
  readonly origin: FactOrigin
  /** The entity the fact is fundamentally about. */
  readonly primaryEntity: EntityRef
  /** Everything else this fact should be findable from. */
  readonly relatedEntities: readonly EntityRef[]
  /** One line a person can read, rendered at write time. */
  readonly summary: string
  readonly consequences: readonly Consequence[]
  readonly metadata: JsonObject
  /** Correlates every fact produced by the same operation. */
  readonly operationId: OperationId | null
}

export const FACT_LINK_ROLES = ['PRIMARIA', 'RELACIONADA'] as const
export type FactLinkRole = (typeof FACT_LINK_ROLES)[number]

/** The index entry that makes a fact reachable from an entity's history. */
export interface FactLink {
  readonly entityType: EntityRef['entityType']
  readonly entityId: string
  readonly role: FactLinkRole
}

export const MAX_FACT_SUMMARY_LENGTH = 280

export const factDraftSchema = z.object({
  type: factTypeSchema,
  occurredAt: instantSchema,
  recordedAt: instantSchema,
  actor: actorSchema,
  origin: factOriginSchema,
  primaryEntity: entityRefSchema,
  relatedEntities: z.array(entityRefSchema).default([]),
  summary: z
    .string()
    .trim()
    .min(1, { error: 'A fact needs a readable summary' })
    .max(MAX_FACT_SUMMARY_LENGTH),
  consequences: z.array(consequenceSchema).default([]),
  metadata: jsonObjectSchema.default({}),
})

export type FactDraft = z.input<typeof factDraftSchema>

export function recordFact(input: {
  id: FactId
  businessId: BusinessId
  operationId: OperationId | null
  draft: FactDraft
}): Fact {
  const draft = factDraftSchema.parse(input.draft)
  return {
    id: input.id,
    businessId: input.businessId,
    type: draft.type,
    occurredAt: draft.occurredAt,
    recordedAt: draft.recordedAt,
    actor: draft.actor,
    origin: draft.origin,
    primaryEntity: draft.primaryEntity,
    relatedEntities: dedupeRelated(draft.primaryEntity, draft.relatedEntities),
    summary: draft.summary,
    consequences: draft.consequences,
    metadata: draft.metadata,
    operationId: input.operationId,
  }
}

function dedupeRelated(primary: EntityRef, related: readonly EntityRef[]): EntityRef[] {
  const seen = new Set<string>([entityRefKey(primary)])
  const unique: EntityRef[] = []
  for (const ref of related) {
    const key = entityRefKey(ref)
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(ref)
  }
  return unique
}

/**
 * The links a fact must be indexed by: the primary entity plus every related one,
 * each exactly once. A fact is never stored twice to appear in two contexts.
 */
export function factLinks(fact: Fact): FactLink[] {
  const links: FactLink[] = [
    {
      entityType: fact.primaryEntity.entityType,
      entityId: fact.primaryEntity.entityId,
      role: 'PRIMARIA',
    },
  ]
  for (const ref of fact.relatedEntities) {
    if (sameEntity(ref, fact.primaryEntity)) continue
    links.push({ entityType: ref.entityType, entityId: ref.entityId, role: 'RELACIONADA' })
  }
  return links
}

/** Every entity this fact can be reached from. */
export function factEntities(fact: Fact): EntityRef[] {
  return [fact.primaryEntity, ...fact.relatedEntities]
}
