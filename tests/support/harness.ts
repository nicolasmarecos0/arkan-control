import { randomUUID } from 'node:crypto'
import type { AppDependencies } from '@/application/dependencies'
import { registerBusiness } from '@/application/use-cases/register-business'
import { registerUser } from '@/application/use-cases/register-user'
import { grantBusinessAccess } from '@/application/use-cases/grant-business-access'
import type { BusinessRole } from '@/domain/access/access-grant'
import { userActor, type Actor } from '@/domain/facts/actor'
import { businessId, userId } from '@/domain/shared/ids'
import { createAppDependencies } from '@/infrastructure/container'
import { FixedClock } from '@/infrastructure/system/clock'

export const TEST_NOW = new Date('2026-08-20T14:30:00.000Z')

export interface TestHarness {
  readonly deps: AppDependencies
  readonly clock: FixedClock
}

export function createHarness(now: Date = TEST_NOW): TestHarness {
  const clock = new FixedClock(now)
  const deps = createAppDependencies({ clock })
  return { deps, clock }
}

export const SYSTEM_TEST_ACTOR: Actor = {
  actorType: 'SISTEMA',
  actorId: null,
  actorLabel: 'suite',
}

export function actorFor(id: string, label: string): Actor {
  return userActor(id, label)
}

export function freshKey(prefix: string): string {
  return `${prefix}-${randomUUID()}`
}

/** Creates a business with a unique name and returns its id. */
export async function seedBusiness(
  deps: AppDependencies,
  overrides: { name?: string; initialBalancePyg?: number; initialBalanceDate?: string } = {},
) {
  const { result } = await registerBusiness(deps, {
    business: {
      name: overrides.name ?? `Negocio ${randomUUID().slice(0, 8)}`,
      initialBalancePyg: overrides.initialBalancePyg ?? 1_500_000,
      initialBalanceDate: overrides.initialBalanceDate ?? '2026-08-01',
    },
    actor: SYSTEM_TEST_ACTOR,
    origin: 'SEED',
    idempotencyKey: freshKey('negocio'),
  })
  return { id: businessId(result.businessId), factId: result.factId }
}

export async function seedUser(deps: AppDependencies, displayName: string) {
  const { result } = await registerUser(deps, {
    user: { email: `${randomUUID()}@arkan.test`, displayName },
    idempotencyKey: freshKey('usuario'),
  })
  return userId(result.userId)
}

export async function seedAccess(
  deps: AppDependencies,
  input: {
    businessId: ReturnType<typeof businessId>
    userId: ReturnType<typeof userId>
    role: BusinessRole
  },
) {
  const { result } = await grantBusinessAccess(deps, {
    businessId: input.businessId,
    userId: input.userId,
    role: input.role,
    actor: SYSTEM_TEST_ACTOR,
    origin: 'SEED',
    idempotencyKey: freshKey('acceso'),
  })
  return result
}
