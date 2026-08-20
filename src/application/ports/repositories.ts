import type { AccessGrant } from '@/domain/access/access-grant'
import type { User } from '@/domain/access/user'
import type { Business } from '@/domain/business/business'
import type { AccessGrantId, BusinessId, UserId } from '@/domain/shared/ids'

/**
 * Every read and write of operative data is scoped by business. There is no
 * repository method that can reach outside the scope it is given.
 */
export interface BusinessRepository {
  insert(business: Business): Promise<void>
  findById(id: BusinessId): Promise<Business | null>
}

export interface UserRepository {
  insert(user: User): Promise<void>
  findById(id: UserId): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
}

export interface AccessGrantRepository {
  insert(grant: AccessGrant): Promise<void>
  update(grant: AccessGrant): Promise<void>
  findById(businessId: BusinessId, id: AccessGrantId): Promise<AccessGrant | null>
  findByUser(businessId: BusinessId, userId: UserId): Promise<AccessGrant | null>
  listByBusiness(businessId: BusinessId): Promise<AccessGrant[]>
}
