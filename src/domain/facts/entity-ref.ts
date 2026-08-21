import { z } from 'zod'

/**
 * The kinds of entity a fact can point at.
 *
 * This registry is the extension point of the Libro de Hechos: a future slice adds
 * its entity kind here (VENTA, VARIANTE, CLIENTE, COBRO...) and the contextual
 * history works for it without a new table and without a new query.
 */
export const ENTITY_TYPES = ['NEGOCIO', 'USUARIO', 'ACCESO'] as const
export type EntityType = (typeof ENTITY_TYPES)[number]

export const entityTypeSchema = z.enum(ENTITY_TYPES)

export interface EntityRef {
  readonly entityType: EntityType
  readonly entityId: string
}

export const entityRefSchema = z.object({
  entityType: entityTypeSchema,
  entityId: z.string().trim().min(1, { error: 'The entity id cannot be empty' }).max(64),
})

export function sameEntity(a: EntityRef, b: EntityRef): boolean {
  return a.entityType === b.entityType && a.entityId === b.entityId
}

export function entityRefKey(ref: EntityRef): string {
  return `${ref.entityType}:${ref.entityId}`
}
