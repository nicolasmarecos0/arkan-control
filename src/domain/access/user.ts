import { z } from 'zod'
import type { UserId } from '../shared/ids'

/**
 * A person who can hold access to one or more businesses. The user record itself
 * is not business scoped — the link to a business is the access grant.
 */
export interface User {
  readonly id: UserId
  readonly email: string
  readonly displayName: string
  readonly createdAt: Date
  readonly updatedAt: Date
}

export const userDraftSchema = z.object({
  email: z.email({ error: 'A valid email is required' }).transform((value) => value.toLowerCase()),
  displayName: z.string().trim().min(1, { error: 'The display name cannot be empty' }).max(120),
})

export type UserDraft = z.infer<typeof userDraftSchema>

export function createUser(input: { id: UserId; draft: UserDraft; now: Date }): User {
  return {
    id: input.id,
    email: input.draft.email,
    displayName: input.draft.displayName,
    createdAt: input.now,
    updatedAt: input.now,
  }
}
