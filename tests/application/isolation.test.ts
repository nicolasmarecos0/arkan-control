import { describe, expect, it } from 'vitest'
import { getEntityHistory, getRecentActivity } from '@/application/queries/fact-queries'
import { revokeBusinessAccess } from '@/application/use-cases/revoke-business-access'
import { accessGrantId, factId } from '@/domain/shared/ids'
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

describe('business isolation', () => {
  it('never returns the facts of another business in recent activity', async () => {
    const businessA = await seedBusiness(deps, { name: 'Negocio A' })
    const businessB = await seedBusiness(deps, { name: 'Negocio B' })

    const activityA = await getRecentActivity(deps, { businessId: businessA.id })
    const activityB = await getRecentActivity(deps, { businessId: businessB.id })

    expect(activityA.facts.every((fact) => fact.businessId === businessA.id)).toBe(true)
    expect(activityB.facts.every((fact) => fact.businessId === businessB.id)).toBe(true)
    expect(activityA.facts.map((fact) => fact.id)).not.toContain(activityB.facts[0]!.id)
  })

  it('cannot read a fact of another business, not even by its id', async () => {
    const businessA = await seedBusiness(deps)
    const businessB = await seedBusiness(deps)

    const factOfA = factId(businessA.factId)
    expect(await deps.facts.byId(businessA.id, factOfA)).not.toBeNull()
    expect(await deps.facts.byId(businessB.id, factOfA)).toBeNull()
  })

  it('cannot reach the history of an entity that lives in another business', async () => {
    const businessA = await seedBusiness(deps)
    const businessB = await seedBusiness(deps)
    const user = await seedUser(deps, 'Ana Dueña')
    const granted = await seedAccess(deps, {
      businessId: businessA.id,
      userId: user,
      role: 'DUENO',
    })

    const fromB = await getEntityHistory(deps, {
      businessId: businessB.id,
      entity: { entityType: 'ACCESO', entityId: granted.accessGrantId },
    })
    expect(fromB.facts).toHaveLength(0)

    const fromBByUser = await getEntityHistory(deps, {
      businessId: businessB.id,
      entity: { entityType: 'USUARIO', entityId: user },
    })
    expect(fromBByUser.facts).toHaveLength(0)
  })

  it('cannot read or change an access grant through another business scope', async () => {
    const businessA = await seedBusiness(deps)
    const businessB = await seedBusiness(deps)
    const user = await seedUser(deps, 'Carlos Contador')
    const granted = await seedAccess(deps, {
      businessId: businessA.id,
      userId: user,
      role: 'CONTADOR',
    })

    expect(
      await deps.read.accessGrants.findById(businessB.id, accessGrantId(granted.accessGrantId)),
    ).toBeNull()

    await expect(
      revokeBusinessAccess(deps, {
        businessId: businessB.id,
        accessGrantId: granted.accessGrantId,
        actor: SYSTEM_TEST_ACTOR,
        origin: 'SEED',
        idempotencyKey: freshKey('revocar'),
      }),
    ).rejects.toThrow(/does not exist in this business/)

    const untouched = await deps.read.accessGrants.findById(
      businessA.id,
      accessGrantId(granted.accessGrantId),
    )
    expect(untouched?.status).toBe('ACTIVO')
  })

  it('a user with access to one business does not appear in the other', async () => {
    const businessA = await seedBusiness(deps)
    const businessB = await seedBusiness(deps)
    const user = await seedUser(deps, 'Ana Dueña')
    await seedAccess(deps, { businessId: businessA.id, userId: user, role: 'DUENO' })

    expect(await deps.read.accessGrants.listByBusiness(businessB.id)).toHaveLength(0)
    expect(await deps.read.accessGrants.findByUser(businessB.id, user)).toBeNull()
  })
})
