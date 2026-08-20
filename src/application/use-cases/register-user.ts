import { z } from 'zod'
import { createUser, userDraftSchema } from '@/domain/access/user'
import { InvariantViolationError } from '@/domain/shared/errors'
import type { AppDependencies } from '../dependencies'

export const registerUserInputSchema = z.object({
  user: userDraftSchema,
  idempotencyKey: z.string().trim().min(1).max(120),
})

export type RegisterUserInput = z.input<typeof registerUserInputSchema>

export type RegisterUserResult = {
  readonly userId: string
}

/**
 * A user is a platform record, not business data: it carries no business_id and
 * produces no fact. What ties a person to a business — and what the Libro de
 * Hechos records — is the access grant.
 */
export async function registerUser(
  deps: AppDependencies,
  rawInput: RegisterUserInput,
): Promise<{ result: RegisterUserResult; replayed: boolean }> {
  const input = registerUserInputSchema.parse(rawInput)
  const id = deps.ids.userId()
  const now = deps.clock.now()

  const outcome = await deps.unitOfWork.run<RegisterUserResult>(
    { businessId: null, type: 'REGISTRAR_USUARIO', idempotencyKey: input.idempotencyKey },
    async (tx) => {
      const existing = await tx.users.findByEmail(input.user.email)
      if (existing) {
        throw new InvariantViolationError('A user with that email already exists', {
          email: input.user.email,
        })
      }
      const user = createUser({ id, draft: input.user, now })
      await tx.users.insert(user)
      return { userId: id }
    },
  )

  return { result: outcome.result, replayed: outcome.replayed }
}
