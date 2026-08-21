import { randomUUID } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { grantAccess, isActiveAccess, revokeAccess } from '@/domain/access/access-grant'
import { accessGrantId, businessId, userId } from '@/domain/shared/ids'

const base = () =>
  grantAccess({
    id: accessGrantId(randomUUID()),
    businessId: businessId(randomUUID()),
    userId: userId(randomUUID()),
    role: 'CONTADOR',
    grantedAt: new Date('2026-08-01T10:00:00.000Z'),
    now: new Date('2026-08-01T10:00:00.000Z'),
  })

describe('access grants', () => {
  it('starts active', () => {
    const grant = base()
    expect(grant.status).toBe('ACTIVO')
    expect(grant.revokedAt).toBeNull()
    expect(isActiveAccess(grant)).toBe(true)
  })

  it('revokes by changing state, never by deleting history', () => {
    const grant = base()
    const revoked = revokeAccess(grant, {
      revokedAt: new Date('2026-08-15T10:00:00.000Z'),
      now: new Date('2026-08-15T11:00:00.000Z'),
    })
    expect(revoked.status).toBe('REVOCADO')
    expect(revoked.revokedAt?.toISOString()).toBe('2026-08-15T10:00:00.000Z')
    expect(revoked.id).toBe(grant.id)
    expect(revoked.grantedAt).toEqual(grant.grantedAt)
    expect(isActiveAccess(revoked)).toBe(false)
  })

  it('treats a second revocation as a no-op', () => {
    const revoked = revokeAccess(base(), {
      revokedAt: new Date('2026-08-15T10:00:00.000Z'),
      now: new Date('2026-08-15T10:00:00.000Z'),
    })
    const again = revokeAccess(revoked, {
      revokedAt: new Date('2026-08-18T10:00:00.000Z'),
      now: new Date('2026-08-18T10:00:00.000Z'),
    })
    expect(again).toBe(revoked)
    expect(again.revokedAt?.toISOString()).toBe('2026-08-15T10:00:00.000Z')
  })
})
