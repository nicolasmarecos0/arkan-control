import { z } from 'zod'
import type { AccessGrant } from '@/domain/access/access-grant'
import type { User } from '@/domain/access/user'
import type { Business } from '@/domain/business/business'
import { consequenceSchema } from '@/domain/facts/consequence'
import type { EntityType } from '@/domain/facts/entity-ref'
import type { Fact } from '@/domain/facts/fact'
import type { FactType } from '@/domain/facts/fact-type'
import { jsonObjectSchema } from '@/domain/shared/json'
import { accessGrantId, businessId, factId, operationId, userId } from '@/domain/shared/ids'
import { guarani } from '@/domain/money/guarani'
import { calendarDate } from '@/domain/time/time'
import type { AccessGrantRow, BusinessRow, FactRow, UserRow } from './schema'

const consequencesSchema = z.array(consequenceSchema)

export function toBusiness(row: BusinessRow): Business {
  return {
    id: businessId(row.id),
    name: row.name,
    initialBalancePyg: guarani(row.initialBalancePyg),
    initialBalanceDate: calendarDate(row.initialBalanceDate),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export function toUser(row: UserRow): User {
  return {
    id: userId(row.id),
    email: row.email,
    displayName: row.displayName,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export function toAccessGrant(row: AccessGrantRow): AccessGrant {
  return {
    id: accessGrantId(row.id),
    businessId: businessId(row.businessId),
    userId: userId(row.userId),
    role: row.role,
    status: row.status,
    grantedAt: row.grantedAt,
    revokedAt: row.revokedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export function toFact(
  row: FactRow,
  relatedEntities: { entityType: EntityType; entityId: string }[],
): Fact {
  return {
    id: factId(row.id),
    businessId: businessId(row.businessId),
    type: row.type as FactType,
    occurredAt: row.occurredAt,
    recordedAt: row.recordedAt,
    actor: {
      actorType: row.actorType,
      actorId: row.actorId,
      actorLabel: row.actorLabel,
    },
    origin: row.origin,
    primaryEntity: {
      entityType: row.primaryEntityType as EntityType,
      entityId: row.primaryEntityId,
    },
    relatedEntities,
    summary: row.summary,
    consequences: consequencesSchema.parse(row.consequences),
    metadata: jsonObjectSchema.parse(row.metadata),
    operationId: row.operationId ? operationId(row.operationId) : null,
  }
}
