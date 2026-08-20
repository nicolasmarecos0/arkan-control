import { describe, expect, it } from 'vitest'
import { registerBusiness } from '@/application/use-cases/register-business'
import { getEntityHistory } from '@/application/queries/fact-queries'
import { businessId } from '@/domain/shared/ids'
import { createHarness, freshKey, SYSTEM_TEST_ACTOR, TEST_NOW } from '../support/harness'

const harness = createHarness()

describe('registering a business', () => {
  it('stores the declared initial balance as whole guaraníes', async () => {
    const { result } = await registerBusiness(harness.deps, {
      business: {
        name: 'Boutique Aurora',
        initialBalancePyg: 12_450_000,
        initialBalanceDate: '2026-08-01',
      },
      actor: SYSTEM_TEST_ACTOR,
      origin: 'SEED',
      idempotencyKey: freshKey('negocio'),
    })

    const stored = await harness.deps.read.businesses.findById(businessId(result.businessId))
    expect(stored).not.toBeNull()
    expect(stored?.name).toBe('Boutique Aurora')
    expect(stored?.initialBalancePyg).toBe(12_450_000)
    expect(stored?.initialBalanceDate).toBe('2026-08-01')
  })

  it('rejects a fractional initial balance before it reaches the domain', async () => {
    await expect(
      registerBusiness(harness.deps, {
        business: {
          name: 'Boutique Aurora',
          initialBalancePyg: 12_450_000.75,
          initialBalanceDate: '2026-08-01',
        },
        actor: SYSTEM_TEST_ACTOR,
        origin: 'SEED',
        idempotencyKey: freshKey('negocio'),
      }),
    ).rejects.toThrow()
  })

  it('rejects an empty name and a malformed initial balance date', async () => {
    await expect(
      registerBusiness(harness.deps, {
        business: { name: '   ', initialBalancePyg: 1, initialBalanceDate: '2026-08-01' },
        actor: SYSTEM_TEST_ACTOR,
        origin: 'SEED',
        idempotencyKey: freshKey('negocio'),
      }),
    ).rejects.toThrow()

    await expect(
      registerBusiness(harness.deps, {
        business: {
          name: 'Boutique Aurora',
          initialBalancePyg: 1,
          initialBalanceDate: '01/08/2026',
        },
        actor: SYSTEM_TEST_ACTOR,
        origin: 'SEED',
        idempotencyKey: freshKey('negocio'),
      }),
    ).rejects.toThrow()
  })

  it('writes the fact that says the business was created, with its consequences', async () => {
    const occurredAt = new Date('2026-08-05T13:00:00.000Z')
    const { result } = await registerBusiness(harness.deps, {
      business: {
        name: 'Despensa Central',
        initialBalancePyg: 3_000_000,
        initialBalanceDate: '2026-08-05',
      },
      actor: SYSTEM_TEST_ACTOR,
      origin: 'SEED',
      occurredAt,
      idempotencyKey: freshKey('negocio'),
    })

    const id = businessId(result.businessId)
    const history = await getEntityHistory(harness.deps, {
      businessId: id,
      entity: { entityType: 'NEGOCIO', entityId: id },
    })

    expect(history.facts).toHaveLength(1)
    const fact = history.facts[0]!
    expect(fact.type).toBe('NEGOCIO_CREADO')
    expect(fact.summary).toContain('Gs. 3.000.000')
    expect(fact.consequences).toEqual([
      {
        kind: 'ENTIDAD_CREADA',
        entity: { entityType: 'NEGOCIO', entityId: id },
        label: 'Despensa Central',
      },
      {
        kind: 'MONTO_DECLARADO',
        entity: { entityType: 'NEGOCIO', entityId: id },
        concept: 'SALDO_INICIAL',
        amountPyg: 3_000_000,
      },
    ])
  })

  it('keeps fecha del hecho and fecha de registro as separate values', async () => {
    const occurredAt = new Date('2026-08-05T13:00:00.000Z')
    const { result } = await registerBusiness(harness.deps, {
      business: {
        name: 'Kiosco Norte',
        initialBalancePyg: 500_000,
        initialBalanceDate: '2026-08-05',
      },
      actor: SYSTEM_TEST_ACTOR,
      origin: 'SEED',
      occurredAt,
      idempotencyKey: freshKey('negocio'),
    })

    const id = businessId(result.businessId)
    const history = await getEntityHistory(harness.deps, {
      businessId: id,
      entity: { entityType: 'NEGOCIO', entityId: id },
    })
    const fact = history.facts[0]!
    expect(fact.occurredAt.toISOString()).toBe(occurredAt.toISOString())
    expect(fact.recordedAt.toISOString()).toBe(TEST_NOW.toISOString())
    expect(fact.occurredAt.getTime()).toBeLessThan(fact.recordedAt.getTime())
  })
})
