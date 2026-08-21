import { z } from 'zod'
import { businessRoleSchema, grantAccess } from '@/domain/access/access-grant'
import { actorSchema, factOriginSchema } from '@/domain/facts/actor'
import { FACT_TYPES } from '@/domain/facts/fact-type'
import { InvariantViolationError, NotFoundError } from '@/domain/shared/errors'
import { businessIdSchema, userIdSchema } from '@/domain/shared/ids'
import { instantSchema } from '@/domain/time/time'
import type { AppDependencies } from '../dependencies'

export const grantBusinessAccessInputSchema = z.object({
  businessId: businessIdSchema,
  userId: userIdSchema,
  role: businessRoleSchema,
  actor: actorSchema,
  origin: factOriginSchema,
  occurredAt: instantSchema.optional(),
  idempotencyKey: z.string().trim().min(1).max(120),
})

export type GrantBusinessAccessInput = z.input<typeof grantBusinessAccessInputSchema>

export type GrantBusinessAccessResult = {
  readonly accessGrantId: string
  readonly factId: string
}

/**
 * Gives a user access to a business and records the fact. The fact is linked to
 * the grant, to the user and to the business, so it shows up in all three
 * histories while existing once.
 */
export async function grantBusinessAccess(
  deps: AppDependencies,
  rawInput: GrantBusinessAccessInput,
): Promise<{ result: GrantBusinessAccessResult; replayed: boolean }> {
  const input = grantBusinessAccessInputSchema.parse(rawInput)
  const id = deps.ids.accessGrantId()
  const recordedAt = deps.clock.now()
  const occurredAt = input.occurredAt ?? recordedAt

  const outcome = await deps.unitOfWork.run<GrantBusinessAccessResult>(
    {
      businessId: input.businessId,
      type: 'OTORGAR_ACCESO',
      idempotencyKey: input.idempotencyKey,
    },
    async (tx) => {
      const business = await tx.businesses.findById(input.businessId)
      if (!business) {
        throw new NotFoundError('The business does not exist', { businessId: input.businessId })
      }
      const user = await tx.users.findById(input.userId)
      if (!user) {
        throw new NotFoundError('The user does not exist', { userId: input.userId })
      }
      const existing = await tx.accessGrants.findByUser(input.businessId, input.userId)
      if (existing) {
        throw new InvariantViolationError('That user already has a grant on this business', {
          accessGrantId: existing.id,
          status: existing.status,
        })
      }

      const grant = grantAccess({
        id,
        businessId: input.businessId,
        userId: input.userId,
        role: input.role,
        grantedAt: occurredAt,
        now: recordedAt,
      })
      await tx.accessGrants.insert(grant)

      const fact = await tx.facts.append({
        businessId: input.businessId,
        draft: {
          type: FACT_TYPES.ACCESO_OTORGADO,
          occurredAt,
          recordedAt,
          actor: input.actor,
          origin: input.origin,
          primaryEntity: { entityType: 'ACCESO', entityId: id },
          relatedEntities: [
            { entityType: 'USUARIO', entityId: input.userId },
            { entityType: 'NEGOCIO', entityId: input.businessId },
          ],
          summary: `Acceso ${grant.role} otorgado a ${user.displayName}`,
          consequences: [
            {
              kind: 'ENTIDAD_CREADA',
              entity: { entityType: 'ACCESO', entityId: id },
              label: `${grant.role} — ${user.displayName}`,
            },
            {
              kind: 'ESTADO_CAMBIADO',
              entity: { entityType: 'ACCESO', entityId: id },
              field: 'estado',
              from: null,
              to: grant.status,
            },
          ],
          metadata: { rol: grant.role, email: user.email },
        },
      })

      return { accessGrantId: id, factId: fact.id }
    },
  )

  return { result: outcome.result, replayed: outcome.replayed }
}
