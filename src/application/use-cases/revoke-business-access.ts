import { z } from 'zod'
import { revokeAccess } from '@/domain/access/access-grant'
import { actorSchema, factOriginSchema } from '@/domain/facts/actor'
import { FACT_TYPES } from '@/domain/facts/fact-type'
import { NotFoundError } from '@/domain/shared/errors'
import { accessGrantId as parseAccessGrantId, businessIdSchema } from '@/domain/shared/ids'
import { instantSchema } from '@/domain/time/time'
import type { AppDependencies } from '../dependencies'

export const revokeBusinessAccessInputSchema = z.object({
  businessId: businessIdSchema,
  accessGrantId: z.string().transform(parseAccessGrantId),
  actor: actorSchema,
  origin: factOriginSchema,
  occurredAt: instantSchema.optional(),
  idempotencyKey: z.string().trim().min(1).max(120),
})

export type RevokeBusinessAccessInput = z.input<typeof revokeBusinessAccessInputSchema>

export type RevokeBusinessAccessResult = {
  readonly accessGrantId: string
  readonly factId: string | null
  readonly alreadyRevoked: boolean
}

/**
 * Revokes access. The grant is not deleted — it changes state — and the change is
 * recorded as a new fact. Revoking an already revoked grant changes nothing and
 * writes no second fact.
 */
export async function revokeBusinessAccess(
  deps: AppDependencies,
  rawInput: RevokeBusinessAccessInput,
): Promise<{ result: RevokeBusinessAccessResult; replayed: boolean }> {
  const input = revokeBusinessAccessInputSchema.parse(rawInput)
  const recordedAt = deps.clock.now()
  const occurredAt = input.occurredAt ?? recordedAt

  const outcome = await deps.unitOfWork.run<RevokeBusinessAccessResult>(
    {
      businessId: input.businessId,
      type: 'REVOCAR_ACCESO',
      idempotencyKey: input.idempotencyKey,
    },
    async (tx) => {
      const grant = await tx.accessGrants.findById(input.businessId, input.accessGrantId)
      if (!grant) {
        throw new NotFoundError('The access grant does not exist in this business', {
          accessGrantId: input.accessGrantId,
        })
      }
      if (grant.status === 'REVOCADO') {
        return { accessGrantId: grant.id, factId: null, alreadyRevoked: true }
      }

      const revoked = revokeAccess(grant, { revokedAt: occurredAt, now: recordedAt })
      await tx.accessGrants.update(revoked)

      const user = await tx.users.findById(revoked.userId)
      const label = user?.displayName ?? revoked.userId

      const fact = await tx.facts.append({
        businessId: input.businessId,
        draft: {
          type: FACT_TYPES.ACCESO_REVOCADO,
          occurredAt,
          recordedAt,
          actor: input.actor,
          origin: input.origin,
          primaryEntity: { entityType: 'ACCESO', entityId: revoked.id },
          relatedEntities: [
            { entityType: 'USUARIO', entityId: revoked.userId },
            { entityType: 'NEGOCIO', entityId: revoked.businessId },
          ],
          summary: `Acceso ${revoked.role} revocado a ${label}`,
          consequences: [
            {
              kind: 'ESTADO_CAMBIADO',
              entity: { entityType: 'ACCESO', entityId: revoked.id },
              field: 'estado',
              from: grant.status,
              to: revoked.status,
            },
          ],
          metadata: { rol: revoked.role },
        },
      })

      return { accessGrantId: revoked.id, factId: fact.id, alreadyRevoked: false }
    },
  )

  return { result: outcome.result, replayed: outcome.replayed }
}
