import { z } from 'zod'
import type { BusinessId } from '../shared/ids'
import { ValidationError } from '../shared/errors'
import { guaraniSchema, type Guarani } from '../money/guarani'
import { calendarDateSchema, type CalendarDate } from '../time/time'

/**
 * Negocio — the tenant of ARKAN Control.
 *
 * P2-A is one business per account. The declared initial balance is the starting
 * point the owner states; it is a declaration, not a computed figure.
 */
export interface Business {
  readonly id: BusinessId
  readonly name: string
  readonly initialBalancePyg: Guarani
  readonly initialBalanceDate: CalendarDate
  readonly createdAt: Date
  readonly updatedAt: Date
}

export const MAX_BUSINESS_NAME_LENGTH = 120

export const businessNameSchema = z
  .string({ error: 'The business name is required' })
  .trim()
  .min(1, { error: 'The business name cannot be empty' })
  .max(MAX_BUSINESS_NAME_LENGTH, {
    error: `The business name cannot exceed ${MAX_BUSINESS_NAME_LENGTH} characters`,
  })

export const businessDraftSchema = z.object({
  name: businessNameSchema,
  initialBalancePyg: guaraniSchema,
  initialBalanceDate: calendarDateSchema,
})

export type BusinessDraft = z.infer<typeof businessDraftSchema>

export function createBusiness(input: {
  id: BusinessId
  draft: BusinessDraft
  now: Date
}): Business {
  const { id, draft, now } = input
  if (Number.isNaN(now.getTime())) {
    throw new ValidationError('Invalid registration instant for the business')
  }
  return {
    id,
    name: draft.name,
    initialBalancePyg: draft.initialBalancePyg,
    initialBalanceDate: draft.initialBalanceDate,
    createdAt: now,
    updatedAt: now,
  }
}
