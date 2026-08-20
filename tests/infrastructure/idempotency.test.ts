import { eq } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'
import { getRecentActivity } from '@/application/queries/fact-queries'
import { registerBusiness } from '@/application/use-cases/register-business'
import { revokeBusinessAccess } from '@/application/use-cases/revoke-business-access'
import { businessId } from '@/domain/shared/ids'
import { getDb } from '@/infrastructure/db/client'
import { businesses, operations } from '@/infrastructure/db/schema'
import {
  createHarness,
  freshKey,
  seedAccess,
  seedBusiness,
  seedUser,
  SYSTEM_TEST_ACTOR,
} from '../support/harness'

const harness = createHarness()
const { deps } = harness
const db = getDb()

describe('idempotency', () => {
  it('does not run the consequences twice when the same operation is retried', async () => {
    const key = freshKey('negocio')
    const input = {
      business: {
        name: 'Verdulería del Centro',
        initialBalancePyg: 2_000_000,
        initialBalanceDate: '2026-08-01',
      },
      actor: SYSTEM_TEST_ACTOR,
      origin: 'SEED' as const,
      idempotencyKey: key,
    }

    const first = await registerBusiness(deps, input)
    const second = await registerBusiness(deps, input)

    expect(first.replayed).toBe(false)
    expect(second.replayed).toBe(true)
    expect(second.result).toEqual(first.result)

    const rows = await db
      .select()
      .from(businesses)
      .where(eq(businesses.name, 'Verdulería del Centro'))
    expect(rows).toHaveLength(1)

    const activity = await getRecentActivity(deps, {
      businessId: businessId(first.result.businessId),
    })
    expect(activity.facts).toHaveLength(1)
  })

  it('claims the idempotency key exactly once', async () => {
    const key = freshKey('negocio')
    const input = {
      business: { name: 'Kiosco Sur', initialBalancePyg: 1, initialBalanceDate: '2026-08-01' },
      actor: SYSTEM_TEST_ACTOR,
      origin: 'SEED' as const,
      idempotencyKey: key,
    }
    await registerBusiness(deps, input)
    await registerBusiness(deps, input)

    const claims = await db.select().from(operations).where(eq(operations.idempotencyKey, key))
    expect(claims).toHaveLength(1)
  })

  it('runs the operation again when a different key is used', async () => {
    const first = await registerBusiness(deps, {
      business: { name: 'Kiosco Este', initialBalancePyg: 1, initialBalanceDate: '2026-08-01' },
      actor: SYSTEM_TEST_ACTOR,
      origin: 'SEED',
      idempotencyKey: freshKey('negocio'),
    })
    const second = await registerBusiness(deps, {
      business: { name: 'Kiosco Este', initialBalancePyg: 1, initialBalanceDate: '2026-08-01' },
      actor: SYSTEM_TEST_ACTOR,
      origin: 'SEED',
      idempotencyKey: freshKey('negocio'),
    })
    expect(second.replayed).toBe(false)
    expect(second.result.businessId).not.toBe(first.result.businessId)
  })

  it('does not write a second fact when a revocation is retried', async () => {
    const business = await seedBusiness(deps)
    const user = await seedUser(deps, 'Carlos Contador')
    const granted = await seedAccess(deps, {
      businessId: business.id,
      userId: user,
      role: 'CONTADOR',
    })
    const input = {
      businessId: business.id,
      accessGrantId: granted.accessGrantId,
      actor: SYSTEM_TEST_ACTOR,
      origin: 'SEED' as const,
      idempotencyKey: freshKey('revocar'),
    }

    const first = await revokeBusinessAccess(deps, input)
    const second = await revokeBusinessAccess(deps, input)

    expect(first.replayed).toBe(false)
    expect(second.replayed).toBe(true)

    const activity = await getRecentActivity(deps, { businessId: business.id })
    expect(activity.facts.filter((fact) => fact.type === 'ACCESO_REVOCADO')).toHaveLength(1)
  })

  it('does not write a fact when a revocation with a new key finds the grant already revoked', async () => {
    const business = await seedBusiness(deps)
    const user = await seedUser(deps, 'Carlos Contador')
    const granted = await seedAccess(deps, {
      businessId: business.id,
      userId: user,
      role: 'CONTADOR',
    })

    await revokeBusinessAccess(deps, {
      businessId: business.id,
      accessGrantId: granted.accessGrantId,
      actor: SYSTEM_TEST_ACTOR,
      origin: 'SEED',
      idempotencyKey: freshKey('revocar'),
    })
    const again = await revokeBusinessAccess(deps, {
      businessId: business.id,
      accessGrantId: granted.accessGrantId,
      actor: SYSTEM_TEST_ACTOR,
      origin: 'SEED',
      idempotencyKey: freshKey('revocar'),
    })

    expect(again.result.alreadyRevoked).toBe(true)
    expect(again.result.factId).toBeNull()

    const activity = await getRecentActivity(deps, { businessId: business.id })
    expect(activity.facts.filter((fact) => fact.type === 'ACCESO_REVOCADO')).toHaveLength(1)
  })
})
