import { z } from 'zod'
import { entityRefSchema } from '@/domain/facts/entity-ref'
import { businessIdSchema } from '@/domain/shared/ids'
import type { FactPage } from '../ports/fact-ledger'
import type { AppDependencies } from '../dependencies'

export const DEFAULT_FACT_PAGE_SIZE = 25
export const MAX_FACT_PAGE_SIZE = 100

const cursorSchema = z
  .object({ occurredAt: z.string(), seq: z.number().int() })
  .nullish()
  .transform((value) => (value ? { occurredAt: value.occurredAt, seq: value.seq } : null))

export const recentActivityInputSchema = z.object({
  businessId: businessIdSchema,
  limit: z.number().int().min(1).max(MAX_FACT_PAGE_SIZE).default(DEFAULT_FACT_PAGE_SIZE),
  cursor: cursorSchema,
})

export const entityHistoryInputSchema = z.object({
  businessId: businessIdSchema,
  entity: entityRefSchema,
  limit: z.number().int().min(1).max(MAX_FACT_PAGE_SIZE).default(DEFAULT_FACT_PAGE_SIZE),
  cursor: cursorSchema,
})

export type RecentActivityInput = z.input<typeof recentActivityInputSchema>
export type EntityHistoryInput = z.input<typeof entityHistoryInputSchema>

/** Actividad reciente: every fact of the business, newest fecha del hecho first. */
export async function getRecentActivity(
  deps: AppDependencies,
  rawInput: RecentActivityInput,
): Promise<FactPage> {
  const input = recentActivityInputSchema.parse(rawInput)
  return deps.facts.recentActivity(input.businessId, {
    limit: input.limit,
    cursor: input.cursor,
  })
}

/**
 * Historial contextual: the same facts, filtered by the entity they are linked to.
 * Nothing is copied per context — the filter is the link.
 */
export async function getEntityHistory(
  deps: AppDependencies,
  rawInput: EntityHistoryInput,
): Promise<FactPage> {
  const input = entityHistoryInputSchema.parse(rawInput)
  return deps.facts.entityHistory(input.businessId, input.entity, {
    limit: input.limit,
    cursor: input.cursor,
  })
}
