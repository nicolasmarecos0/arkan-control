import type { BusinessId } from '../shared/ids'
import { TenantIsolationError } from '../shared/errors'

/**
 * Every operative row in ARKAN Control belongs to exactly one business. Nothing
 * reads or writes across that boundary: repositories take the scope, and the
 * domain refuses to combine records from two different businesses.
 */
export interface BusinessScoped {
  readonly businessId: BusinessId
}

export function assertSameBusiness(
  expected: BusinessId,
  candidate: BusinessScoped,
  context: string,
): void {
  if (candidate.businessId !== expected) {
    throw new TenantIsolationError(`${context} belongs to a different business`, {
      expected,
      actual: candidate.businessId,
    })
  }
}

export function assertBelongsToScope(
  expected: BusinessId,
  actual: BusinessId,
  context: string,
): void {
  if (actual !== expected) {
    throw new TenantIsolationError(`${context} belongs to a different business`, {
      expected,
      actual,
    })
  }
}
