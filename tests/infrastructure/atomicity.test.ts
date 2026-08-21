import { randomUUID } from 'node:crypto'
import { and, eq, sql } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'
import { getRecentActivity } from '@/application/queries/fact-queries'
import { createBusiness } from '@/domain/business/business'
import { grantAccess } from '@/domain/access/access-grant'
import { accessGrantId, businessId } from '@/domain/shared/ids'
import { guarani } from '@/domain/money/guarani'
import { calendarDate } from '@/domain/time/time'
import { getDb } from '@/infrastructure/db/client'
import { businesses, facts, operations } from '@/infrastructure/db/schema'
import {
  createHarness,
  freshKey,
  seedBusiness,
  seedUser,
  SYSTEM_TEST_ACTOR,
} from '../support/harness'

const harness = createHarness()
const { deps } = harness
const db = getDb()

describe('atomicity', () => {
  it('leaves no partial state when the operation fails halfway', async () => {
    const id = deps.ids.businessId()
    const key = freshKey('fallida')

    await expect(
      deps.unitOfWork.run(
        { businessId: id, type: 'REGISTRAR_NEGOCIO', idempotencyKey: key },
        async (tx) => {
          await tx.businesses.insert(
            createBusiness({
              id,
              draft: {
                name: 'Negocio que no debe existir',
                initialBalancePyg: guarani(1_000_000),
                initialBalanceDate: calendarDate('2026-08-01'),
              },
              now: harness.clock.now(),
            }),
          )
          await tx.facts.append({
            businessId: id,
            draft: {
              type: 'NEGOCIO_CREADO',
              occurredAt: harness.clock.now(),
              recordedAt: harness.clock.now(),
              actor: SYSTEM_TEST_ACTOR,
              origin: 'SEED',
              primaryEntity: { entityType: 'NEGOCIO', entityId: id },
              summary: 'Negocio creado',
            },
          })
          throw new Error('the operation failed after writing everything')
        },
      ),
    ).rejects.toThrow('the operation failed after writing everything')

    // Neither the entity, nor its fact, nor the operation claim survived.
    expect(await deps.read.businesses.findById(id)).toBeNull()
    expect(await db.select().from(businesses).where(eq(businesses.id, id))).toHaveLength(0)
    expect(await db.select().from(facts).where(eq(facts.businessId, id))).toHaveLength(0)
    expect(
      await db.select().from(operations).where(eq(operations.idempotencyKey, key)),
    ).toHaveLength(0)
  })

  it('rolls the whole operation back when a later write violates a constraint', async () => {
    const business = await seedBusiness(deps)
    const user = await seedUser(deps, 'Ana Dueña')
    const before = await getRecentActivity(deps, { businessId: business.id })

    await expect(
      deps.unitOfWork.run(
        {
          businessId: business.id,
          type: 'OTORGAR_ACCESO',
          idempotencyKey: freshKey('acceso'),
        },
        async (tx) => {
          const grant = grantAccess({
            id: accessGrantId(randomUUID()),
            businessId: business.id,
            userId: user,
            role: 'DUENO',
            grantedAt: harness.clock.now(),
            now: harness.clock.now(),
          })
          await tx.accessGrants.insert(grant)
          await tx.facts.append({
            businessId: business.id,
            draft: {
              type: 'ACCESO_OTORGADO',
              occurredAt: harness.clock.now(),
              recordedAt: harness.clock.now(),
              actor: SYSTEM_TEST_ACTOR,
              origin: 'SEED',
              primaryEntity: { entityType: 'ACCESO', entityId: grant.id },
              relatedEntities: [{ entityType: 'USUARIO', entityId: user }],
              summary: 'Acceso DUENO otorgado',
            },
          })
          // Same user, same business: the unique constraint rejects this one.
          await tx.accessGrants.insert({ ...grant, id: accessGrantId(randomUUID()) })
          return { ok: true as const }
        },
      ),
    ).rejects.toThrow()

    const after = await getRecentActivity(deps, { businessId: business.id })
    expect(after.facts.map((fact) => fact.id)).toEqual(before.facts.map((fact) => fact.id))
    expect(await deps.read.accessGrants.listByBusiness(business.id)).toHaveLength(0)
  })

  it('writes the entity and its fact in the same commit', async () => {
    const business = await seedBusiness(deps)
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(facts)
      .where(and(eq(facts.businessId, business.id), eq(facts.type, 'NEGOCIO_CREADO')))
    expect(row?.count).toBe(1)
    expect(await deps.read.businesses.findById(businessId(business.id))).not.toBeNull()
  })
})
