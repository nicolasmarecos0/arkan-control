import { describe, expect, it } from 'vitest'
import { getEntityHistory, getRecentActivity } from '@/application/queries/fact-queries'
import { revokeBusinessAccess } from '@/application/use-cases/revoke-business-access'
import { registerBusiness } from '@/application/use-cases/register-business'
import { businessId, factId } from '@/domain/shared/ids'
import {
  actorFor,
  createHarness,
  freshKey,
  seedAccess,
  seedBusiness,
  seedUser,
  SYSTEM_TEST_ACTOR,
} from '../support/harness'

const harness = createHarness()
const { deps } = harness

describe('Libro de Hechos', () => {
  it('records a fact and links it to its primary entity', async () => {
    const business = await seedBusiness(deps)
    const history = await getEntityHistory(deps, {
      businessId: business.id,
      entity: { entityType: 'NEGOCIO', entityId: business.id },
    })
    expect(history.facts).toHaveLength(1)
    expect(history.facts[0]!.primaryEntity).toEqual({
      entityType: 'NEGOCIO',
      entityId: business.id,
    })
  })

  it('links one fact to several entities at once', async () => {
    const business = await seedBusiness(deps)
    const user = await seedUser(deps, 'Ana Dueña')
    const granted = await seedAccess(deps, {
      businessId: business.id,
      userId: user,
      role: 'DUENO',
    })

    const fromGrant = await getEntityHistory(deps, {
      businessId: business.id,
      entity: { entityType: 'ACCESO', entityId: granted.accessGrantId },
    })
    const fact = fromGrant.facts[0]!
    expect(fact.primaryEntity.entityType).toBe('ACCESO')
    expect(fact.relatedEntities).toEqual(
      expect.arrayContaining([
        { entityType: 'USUARIO', entityId: user },
        { entityType: 'NEGOCIO', entityId: business.id },
      ]),
    )
    expect(fact.relatedEntities).toHaveLength(2)
  })

  it('shows the same fact from every context without storing it twice', async () => {
    const business = await seedBusiness(deps)
    const user = await seedUser(deps, 'Carlos Contador')
    const granted = await seedAccess(deps, {
      businessId: business.id,
      userId: user,
      role: 'CONTADOR',
    })

    const fromGrant = await getEntityHistory(deps, {
      businessId: business.id,
      entity: { entityType: 'ACCESO', entityId: granted.accessGrantId },
    })
    const fromUser = await getEntityHistory(deps, {
      businessId: business.id,
      entity: { entityType: 'USUARIO', entityId: user },
    })
    const fromBusiness = await getEntityHistory(deps, {
      businessId: business.id,
      entity: { entityType: 'NEGOCIO', entityId: business.id },
    })
    const recent = await getRecentActivity(deps, { businessId: business.id })

    // The grant fact reaches four contexts and is one single row.
    expect(fromGrant.facts.map((fact) => fact.id)).toEqual([granted.factId])
    expect(fromUser.facts.map((fact) => fact.id)).toEqual([granted.factId])
    expect(fromBusiness.facts.map((fact) => fact.id)).toContain(granted.factId)
    expect(fromBusiness.facts.filter((fact) => fact.id === granted.factId)).toHaveLength(1)
    expect(recent.facts.filter((fact) => fact.id === granted.factId)).toHaveLength(1)
  })

  it('lists the recent activity of the business, newest fecha del hecho first', async () => {
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
      occurredAt: new Date('2026-08-21T10:00:00.000Z'),
      idempotencyKey: freshKey('revocar'),
    })

    const recent = await getRecentActivity(deps, { businessId: business.id })
    expect(recent.facts.map((fact) => fact.type)).toEqual([
      'ACCESO_REVOCADO',
      'ACCESO_OTORGADO',
      'NEGOCIO_CREADO',
    ])
    const occurred = recent.facts.map((fact) => fact.occurredAt.getTime())
    expect(occurred).toEqual([...occurred].sort((a, b) => b - a))
  })

  it('keeps actor and origin traceable on every fact', async () => {
    const business = await seedBusiness(deps)
    const owner = await seedUser(deps, 'Ana Dueña')
    const { result } = await registerBusinessAsOwner(owner)

    const recent = await getRecentActivity(deps, { businessId: businessId(result.businessId) })
    const fact = recent.facts[0]!
    expect(fact.actor).toEqual({
      actorType: 'USUARIO',
      actorId: owner,
      actorLabel: 'Ana Dueña',
    })
    expect(fact.origin).toBe('UI')

    const seeded = await getRecentActivity(deps, { businessId: business.id })
    expect(seeded.facts[0]!.actor.actorType).toBe('SISTEMA')
    expect(seeded.facts[0]!.origin).toBe('SEED')
  })

  it('correlates every fact of one operation through the operation id', async () => {
    const business = await seedBusiness(deps)
    const user = await seedUser(deps, 'Ana Dueña')
    const granted = await seedAccess(deps, {
      businessId: business.id,
      userId: user,
      role: 'DUENO',
    })
    const fact = await deps.facts.byId(business.id, factId(granted.factId))
    expect(fact?.operationId).not.toBeNull()

    const sameOperation = await deps.facts.byOperation(business.id, fact!.operationId!)
    expect(sameOperation.map((item) => item.id)).toEqual([granted.factId])
  })

  it('pages through the ledger without repeating or skipping a fact', async () => {
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

    const first = await getRecentActivity(deps, { businessId: business.id, limit: 2 })
    expect(first.facts).toHaveLength(2)
    expect(first.nextCursor).not.toBeNull()

    const second = await getRecentActivity(deps, {
      businessId: business.id,
      limit: 2,
      cursor: first.nextCursor,
    })
    expect(second.facts).toHaveLength(1)
    expect(second.nextCursor).toBeNull()

    const ids = [...first.facts, ...second.facts].map((fact) => fact.id)
    expect(new Set(ids).size).toBe(3)
  })
})

async function registerBusinessAsOwner(ownerId: string) {
  return registerBusiness(deps, {
    business: {
      name: 'Negocio de Ana',
      initialBalancePyg: 900_000,
      initialBalanceDate: '2026-08-01',
    },
    actor: actorFor(ownerId, 'Ana Dueña'),
    origin: 'UI',
    idempotencyKey: freshKey('negocio'),
  })
}
