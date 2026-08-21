import { z } from 'zod'
import { entityRefSchema } from './entity-ref'
import { guaraniSchema } from '../money/guarani'

/**
 * The structured consequences of a fact.
 *
 * A fact is not a log line: it states what changed, on which entity, by how much.
 * That is what later lets ARKAN answer "de dónde salió este número" without
 * re-deriving it from the current state.
 *
 * The set of kinds is deliberately small and closed. A slice that produces a new
 * kind of consequence (a stock movement, a cash movement) adds it here, and every
 * reader keeps working because the union is discriminated by `kind`.
 */
export const CONSEQUENCE_KINDS = ['ENTIDAD_CREADA', 'ESTADO_CAMBIADO', 'MONTO_DECLARADO'] as const
export type ConsequenceKind = (typeof CONSEQUENCE_KINDS)[number]

export const entityCreatedConsequenceSchema = z.object({
  kind: z.literal('ENTIDAD_CREADA'),
  entity: entityRefSchema,
  label: z.string().trim().min(1).max(200),
})

export const stateChangedConsequenceSchema = z.object({
  kind: z.literal('ESTADO_CAMBIADO'),
  entity: entityRefSchema,
  field: z.string().trim().min(1).max(60),
  from: z.string().trim().max(60).nullable(),
  to: z.string().trim().min(1).max(60),
})

export const amountDeclaredConsequenceSchema = z.object({
  kind: z.literal('MONTO_DECLARADO'),
  entity: entityRefSchema,
  concept: z.string().trim().min(1).max(60),
  amountPyg: guaraniSchema,
})

export const consequenceSchema = z.discriminatedUnion('kind', [
  entityCreatedConsequenceSchema,
  stateChangedConsequenceSchema,
  amountDeclaredConsequenceSchema,
])

export type EntityCreatedConsequence = z.infer<typeof entityCreatedConsequenceSchema>
export type StateChangedConsequence = z.infer<typeof stateChangedConsequenceSchema>
export type AmountDeclaredConsequence = z.infer<typeof amountDeclaredConsequenceSchema>
export type Consequence = z.infer<typeof consequenceSchema>
