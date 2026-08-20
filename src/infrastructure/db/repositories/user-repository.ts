import { eq } from 'drizzle-orm'
import type { UserRepository } from '@/application/ports/repositories'
import type { User } from '@/domain/access/user'
import type { UserId } from '@/domain/shared/ids'
import type { Executor } from '../client'
import { toUser } from '../mappers'
import { users } from '../schema'

export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly db: Executor) {}

  async insert(user: User): Promise<void> {
    await this.db.insert(users).values({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
  }

  async findById(id: UserId): Promise<User | null> {
    const [row] = await this.db.select().from(users).where(eq(users.id, id)).limit(1)
    return row ? toUser(row) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1)
    return row ? toUser(row) : null
  }
}
