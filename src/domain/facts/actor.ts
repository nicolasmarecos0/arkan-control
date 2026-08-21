import { z } from 'zod'

/**
 * Who caused the fact, and through which channel it entered ARKAN.
 *
 * Both travel with every fact: "quién" and "origen" are part of the answer the
 * Libro de Hechos has to give, and neither can be reconstructed afterwards.
 */
export const ACTOR_TYPES = ['USUARIO', 'SISTEMA'] as const
export type ActorType = (typeof ACTOR_TYPES)[number]

export interface Actor {
  readonly actorType: ActorType
  /** The user id when a person acted; null when ARKAN itself did. */
  readonly actorId: string | null
  /** Human readable label, frozen at the moment of the fact. */
  readonly actorLabel: string
}

export const actorSchema = z
  .object({
    actorType: z.enum(ACTOR_TYPES),
    actorId: z.string().trim().min(1).max(64).nullable(),
    actorLabel: z.string().trim().min(1, { error: 'The actor label cannot be empty' }).max(160),
  })
  .refine((actor) => actor.actorType !== 'USUARIO' || actor.actorId !== null, {
    error: 'A fact caused by a user must carry the user id',
    path: ['actorId'],
  })

export const SYSTEM_ACTOR: Actor = {
  actorType: 'SISTEMA',
  actorId: null,
  actorLabel: 'ARKAN',
}

export function userActor(userId: string, label: string): Actor {
  return { actorType: 'USUARIO', actorId: userId, actorLabel: label }
}

/** How the fact reached ARKAN. */
export const FACT_ORIGINS = ['UI', 'API', 'SISTEMA', 'SEED'] as const
export type FactOrigin = (typeof FACT_ORIGINS)[number]
export const factOriginSchema = z.enum(FACT_ORIGINS)
