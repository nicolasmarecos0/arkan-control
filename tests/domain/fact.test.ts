import { randomUUID } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { factEntities, factLinks, recordFact } from '@/domain/facts/fact'
import { FACT_TYPES } from '@/domain/facts/fact-type'
import { businessId, factId, operationId } from '@/domain/shared/ids'

const business = businessId(randomUUID())
const id = factId(randomUUID())
const operation = operationId(randomUUID())
const grantId = randomUUID()
const personId = randomUUID()

function build(
  relatedEntities: { entityType: 'NEGOCIO' | 'USUARIO' | 'ACCESO'; entityId: string }[],
) {
  return recordFact({
    id,
    businessId: business,
    operationId: operation,
    draft: {
      type: FACT_TYPES.ACCESO_OTORGADO,
      occurredAt: new Date('2026-08-10T12:00:00.000Z'),
      recordedAt: new Date('2026-08-20T09:00:00.000Z'),
      actor: { actorType: 'USUARIO', actorId: personId, actorLabel: 'Ana' },
      origin: 'UI',
      primaryEntity: { entityType: 'ACCESO', entityId: grantId },
      relatedEntities,
      summary: 'Acceso CONTADOR otorgado a Ana',
      consequences: [
        {
          kind: 'ESTADO_CAMBIADO',
          entity: { entityType: 'ACCESO', entityId: grantId },
          field: 'estado',
          from: null,
          to: 'ACTIVO',
        },
      ],
      metadata: { rol: 'CONTADOR' },
    },
  })
}

describe('recording a fact', () => {
  it('keeps what happened, when, who and where it came from', () => {
    const fact = build([{ entityType: 'USUARIO', entityId: personId }])
    expect(fact.type).toBe(FACT_TYPES.ACCESO_OTORGADO)
    expect(fact.occurredAt.toISOString()).toBe('2026-08-10T12:00:00.000Z')
    expect(fact.recordedAt.toISOString()).toBe('2026-08-20T09:00:00.000Z')
    expect(fact.actor).toEqual({ actorType: 'USUARIO', actorId: personId, actorLabel: 'Ana' })
    expect(fact.origin).toBe('UI')
    expect(fact.operationId).toBe(operation)
  })

  it('stores consequences as structured data, not as prose', () => {
    const fact = build([])
    expect(fact.consequences[0]).toMatchObject({
      kind: 'ESTADO_CAMBIADO',
      field: 'estado',
      from: null,
      to: 'ACTIVO',
    })
  })

  it('rejects a user fact without the user id', () => {
    expect(() =>
      recordFact({
        id,
        businessId: business,
        operationId: null,
        draft: {
          type: FACT_TYPES.NEGOCIO_CREADO,
          occurredAt: new Date(),
          recordedAt: new Date(),
          actor: { actorType: 'USUARIO', actorId: null, actorLabel: 'Ana' },
          origin: 'UI',
          primaryEntity: { entityType: 'NEGOCIO', entityId: business },
          summary: 'Negocio creado',
        },
      }),
    ).toThrow()
  })

  it('rejects an empty summary', () => {
    expect(() =>
      recordFact({
        id,
        businessId: business,
        operationId: null,
        draft: {
          type: FACT_TYPES.NEGOCIO_CREADO,
          occurredAt: new Date(),
          recordedAt: new Date(),
          actor: { actorType: 'SISTEMA', actorId: null, actorLabel: 'ARKAN' },
          origin: 'SISTEMA',
          primaryEntity: { entityType: 'NEGOCIO', entityId: business },
          summary: '   ',
        },
      }),
    ).toThrow()
  })
})

describe('fact links', () => {
  it('indexes the primary entity once and every related entity once', () => {
    const fact = build([
      { entityType: 'USUARIO', entityId: personId },
      { entityType: 'NEGOCIO', entityId: business },
    ])
    const links = factLinks(fact)
    expect(links).toHaveLength(3)
    expect(links.filter((link) => link.role === 'PRIMARIA')).toHaveLength(1)
    expect(new Set(links.map((link) => `${link.entityType}:${link.entityId}`)).size).toBe(3)
  })

  it('never indexes the same entity twice, even if the caller repeats it', () => {
    const fact = build([
      { entityType: 'USUARIO', entityId: personId },
      { entityType: 'USUARIO', entityId: personId },
      { entityType: 'ACCESO', entityId: grantId },
    ])
    expect(fact.relatedEntities).toHaveLength(1)
    expect(factLinks(fact)).toHaveLength(2)
    expect(factEntities(fact)).toHaveLength(2)
  })
})
