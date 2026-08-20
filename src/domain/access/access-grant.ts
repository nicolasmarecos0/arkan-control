import { z } from 'zod'
import type { AccessGrantId, BusinessId, UserId } from '../shared/ids'
import { assertBelongsToScope } from '../tenancy/tenancy'

/**
 * Access to a business.
 *
 * P2-A knows two roles and two states. There is no permission matrix here on
 * purpose: granular RBAC is still an open question, so the model stores the role
 * and the state and nothing else infers rights from them yet.
 */
export const BUSINESS_ROLES = ['DUENO', 'CONTADOR'] as const
export type BusinessRole = (typeof BUSINESS_ROLES)[number]
export const businessRoleSchema = z.enum(BUSINESS_ROLES)

export const ACCESS_STATUSES = ['ACTIVO', 'REVOCADO'] as const
export type AccessStatus = (typeof ACCESS_STATUSES)[number]
export const accessStatusSchema = z.enum(ACCESS_STATUSES)

export interface AccessGrant {
  readonly id: AccessGrantId
  readonly businessId: BusinessId
  readonly userId: UserId
  readonly role: BusinessRole
  readonly status: AccessStatus
  readonly grantedAt: Date
  readonly revokedAt: Date | null
  readonly createdAt: Date
  readonly updatedAt: Date
}

export function grantAccess(input: {
  id: AccessGrantId
  businessId: BusinessId
  userId: UserId
  role: BusinessRole
  grantedAt: Date
  now: Date
}): AccessGrant {
  return {
    id: input.id,
    businessId: input.businessId,
    userId: input.userId,
    role: input.role,
    status: 'ACTIVO',
    grantedAt: input.grantedAt,
    revokedAt: null,
    createdAt: input.now,
    updatedAt: input.now,
  }
}

/**
 * Revoking is a state change, never a delete: the grant stays, so the history of
 * who had access and when remains readable. Revoking twice is a no-op — the first
 * revocation is the one that happened.
 */
export function revokeAccess(
  grant: AccessGrant,
  input: { revokedAt: Date; now: Date },
): AccessGrant {
  if (grant.status === 'REVOCADO') {
    return grant
  }
  return {
    ...grant,
    status: 'REVOCADO',
    revokedAt: input.revokedAt,
    updatedAt: input.now,
  }
}

export function isActiveAccess(grant: AccessGrant): boolean {
  return grant.status === 'ACTIVO'
}

export function assertGrantInScope(businessId: BusinessId, grant: AccessGrant): void {
  assertBelongsToScope(businessId, grant.businessId, 'The access grant')
}
