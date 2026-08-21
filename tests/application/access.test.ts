import { describe, expect, it } from 'vitest'
import { grantBusinessAccess } from '@/application/use-cases/grant-business-access'
import { revokeBusinessAccess } from '@/application/use-cases/revoke-business-access'
import { getEntityHistory } from '@/application/queries/fact-queries'
import { accessGrantId } from '@/domain/shared/ids'
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

describe('access to a business', () => {
  it('places the dueño and the contador in the business they were granted', async () => {
    const businessA = await seedBusiness(deps)
    const businessB = await seedBusiness(deps)
    const owner = await seedUser(deps, 'Ana Dueña')
    const accountant = await seedUser(deps, 'Carlos Contador')

    await seedAccess(deps, { businessId: businessA.id, userId: owner, role: 'DUENO' })
    await seedAccess(deps, { businessId: businessB.id, userId: accountant, role: 'CONTADOR' })

    const inA = await deps.read.accessGrants.listByBusiness(businessA.id)
    const inB = await deps.read.accessGrants.listByBusiness(businessB.id)

    expect(inA).toHaveLength(1)
    expect(inA[0]!.role).toBe('DUENO')
    expect(inA[0]!.userId).toBe(owner)
    expect(inA[0]!.businessId).toBe(businessA.id)

    expect(inB).toHaveLength(1)
    expect(inB[0]!.role).toBe('CONTADOR')
    expect(inB[0]!.businessId).toBe(businessB.id)

    // The accountant of B is invisible from A.
    expect(await deps.read.accessGrants.findByUser(businessA.id, accountant)).toBeNull()
  })

  it('keeps a revoked access distinguishable from an active one', async () => {
    const business = await seedBusiness(deps)
    const owner = await seedUser(deps, 'Ana Dueña')
    const accountant = await seedUser(deps, 'Carlos Contador')
    await seedAccess(deps, { businessId: business.id, userId: owner, role: 'DUENO' })
    const granted = await seedAccess(deps, {
      businessId: business.id,
      userId: accountant,
      role: 'CONTADOR',
    })

    await revokeBusinessAccess(deps, {
      businessId: business.id,
      accessGrantId: granted.accessGrantId,
      actor: SYSTEM_TEST_ACTOR,
      origin: 'SEED',
      idempotencyKey: freshKey('revocar'),
    })

    const grants = await deps.read.accessGrants.listByBusiness(business.id)
    expect(grants).toHaveLength(2)
    const byStatus = Object.fromEntries(grants.map((grant) => [grant.role, grant.status]))
    expect(byStatus).toEqual({ DUENO: 'ACTIVO', CONTADOR: 'REVOCADO' })

    const revoked = grants.find((grant) => grant.role === 'CONTADOR')!
    expect(revoked.revokedAt).not.toBeNull()
    expect(revoked.grantedAt).not.toBeNull()
  })

  it('does not delete the revoked grant, and records the revocation as a new fact', async () => {
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

    const stillThere = await deps.read.accessGrants.findById(
      business.id,
      accessGrantId(granted.accessGrantId),
    )
    expect(stillThere?.status).toBe('REVOCADO')

    const history = await getEntityHistory(deps, {
      businessId: business.id,
      entity: { entityType: 'ACCESO', entityId: granted.accessGrantId },
    })
    expect(history.facts.map((fact) => fact.type)).toEqual(['ACCESO_REVOCADO', 'ACCESO_OTORGADO'])
  })

  it('refuses a second grant for the same user in the same business', async () => {
    const business = await seedBusiness(deps)
    const user = await seedUser(deps, 'Ana Dueña')
    await seedAccess(deps, { businessId: business.id, userId: user, role: 'DUENO' })

    await expect(
      grantBusinessAccess(deps, {
        businessId: business.id,
        userId: user,
        role: 'CONTADOR',
        actor: SYSTEM_TEST_ACTOR,
        origin: 'SEED',
        idempotencyKey: freshKey('acceso'),
      }),
    ).rejects.toThrow(/already has a grant/)
  })
})
