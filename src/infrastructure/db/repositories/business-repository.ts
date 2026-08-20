import { eq } from 'drizzle-orm'
import type { BusinessRepository } from '@/application/ports/repositories'
import type { Business } from '@/domain/business/business'
import type { BusinessId } from '@/domain/shared/ids'
import type { Executor } from '../client'
import { toBusiness } from '../mappers'
import { businesses } from '../schema'

export class DrizzleBusinessRepository implements BusinessRepository {
  constructor(private readonly db: Executor) {}

  async insert(business: Business): Promise<void> {
    await this.db.insert(businesses).values({
      id: business.id,
      name: business.name,
      initialBalancePyg: business.initialBalancePyg,
      initialBalanceDate: business.initialBalanceDate,
      createdAt: business.createdAt,
      updatedAt: business.updatedAt,
    })
  }

  async findById(id: BusinessId): Promise<Business | null> {
    const [row] = await this.db.select().from(businesses).where(eq(businesses.id, id)).limit(1)
    return row ? toBusiness(row) : null
  }
}
