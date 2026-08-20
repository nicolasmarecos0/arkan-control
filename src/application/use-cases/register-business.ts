import { z } from 'zod'
import { createBusiness, businessDraftSchema } from '@/domain/business/business'
import { actorSchema, factOriginSchema } from '@/domain/facts/actor'
import { FACT_TYPES } from '@/domain/facts/fact-type'
import { formatPyg } from '@/domain/money/guarani'
import { instantSchema } from '@/domain/time/time'
import type { AppDependencies } from '../dependencies'

export const registerBusinessInputSchema = z.object({
  business: businessDraftSchema,
  actor: actorSchema,
  origin: factOriginSchema,
  /** Fecha del hecho. Defaults to now when the caller does not declare one. */
  occurredAt: instantSchema.optional(),
  idempotencyKey: z.string().trim().min(1).max(120),
})

export type RegisterBusinessInput = z.input<typeof registerBusinessInputSchema>

export type RegisterBusinessResult = {
  readonly businessId: string
  readonly factId: string
}

/**
 * Creates the business and writes the fact that says so, in one transaction.
 * There is no path that produces a business without its fact.
 */
export async function registerBusiness(
  deps: AppDependencies,
  rawInput: RegisterBusinessInput,
): Promise<{ result: RegisterBusinessResult; replayed: boolean }> {
  const input = registerBusinessInputSchema.parse(rawInput)
  const id = deps.ids.businessId()
  const recordedAt = deps.clock.now()
  const occurredAt = input.occurredAt ?? recordedAt

  // The claim is platform scoped: the business does not exist yet, so scoping the
  // key by the id we are about to mint would make every retry a fresh operation.
  // The id it created is part of the stored outcome.
  const outcome = await deps.unitOfWork.run<RegisterBusinessResult>(
    { businessId: null, type: 'REGISTRAR_NEGOCIO', idempotencyKey: input.idempotencyKey },
    async (tx) => {
      const business = createBusiness({ id, draft: input.business, now: recordedAt })
      await tx.businesses.insert(business)

      const fact = await tx.facts.append({
        businessId: id,
        draft: {
          type: FACT_TYPES.NEGOCIO_CREADO,
          occurredAt,
          recordedAt,
          actor: input.actor,
          origin: input.origin,
          primaryEntity: { entityType: 'NEGOCIO', entityId: id },
          relatedEntities: [],
          summary: `Negocio "${business.name}" creado con saldo inicial ${formatPyg(
            business.initialBalancePyg,
          )} declarado al ${business.initialBalanceDate}`,
          consequences: [
            {
              kind: 'ENTIDAD_CREADA',
              entity: { entityType: 'NEGOCIO', entityId: id },
              label: business.name,
            },
            {
              kind: 'MONTO_DECLARADO',
              entity: { entityType: 'NEGOCIO', entityId: id },
              concept: 'SALDO_INICIAL',
              amountPyg: business.initialBalancePyg,
            },
          ],
          metadata: { saldoInicialFecha: business.initialBalanceDate },
        },
      })

      return { businessId: id, factId: fact.id }
    },
  )

  return { result: outcome.result, replayed: outcome.replayed }
}
