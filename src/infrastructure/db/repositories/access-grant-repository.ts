import { and, eq } from 'drizzle-orm'
import type { AccessGrantRepository } from '@/application/ports/repositories'
import type { AccessGrant } from '@/domain/access/access-grant'
import type { AccessGrantId, BusinessId, UserId } from '@/domain/shared/ids'
import type { Executor } from '../client'
import { toAccessGrant } from '../mappers'
import { accessGrants } from '../schema'

/**
 * Every query carries the business scope in its WHERE clause. There is no method
 * that reads a grant by id alone.
 */
export class DrizzleAccessGrantRepository implements AccessGrantRepository {
  constructor(private readonly db: Executor) {}

  async insert(grant: AccessGrant): Promise<void> {
    await this.db.insert(accessGrants).values({
      id: grant.id,
      businessId: grant.businessId,
      userId: grant.userId,
      role: grant.role,
      status: grant.status,
      grantedAt: grant.grantedAt,
      revokedAt: grant.revokedAt,
      createdAt: grant.createdAt,
      updatedAt: grant.updatedAt,
    })
  }

  async update(grant: AccessGrant): Promise<void> {
    await this.db
      .update(accessGrants)
      .set({
        role: grant.role,
        status: grant.status,
        revokedAt: grant.revokedAt,
        updatedAt: grant.updatedAt,
      })
      .where(and(eq(accessGrants.id, grant.id), eq(accessGrants.businessId, grant.businessId)))
  }

  async findById(businessId: BusinessId, id: AccessGrantId): Promise<AccessGrant | null> {
    const [row] = await this.db
      .select()
      .from(accessGrants)
      .where(and(eq(accessGrants.id, id), eq(accessGrants.businessId, businessId)))
      .limit(1)
    return row ? toAccessGrant(row) : null
  }

  async findByUser(businessId: BusinessId, userId: UserId): Promise<AccessGrant | null> {
    const [row] = await this.db
      .select()
      .from(accessGrants)
      .where(and(eq(accessGrants.businessId, businessId), eq(accessGrants.userId, userId)))
      .limit(1)
    return row ? toAccessGrant(row) : null
  }

  async listByBusiness(businessId: BusinessId): Promise<AccessGrant[]> {
    const rows = await this.db
      .select()
      .from(accessGrants)
      .where(eq(accessGrants.businessId, businessId))
      .orderBy(accessGrants.createdAt)
    return rows.map(toAccessGrant)
  }
}
