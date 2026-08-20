import { randomUUID } from 'node:crypto'
import { config } from 'dotenv'
import { registerBusiness } from '../src/application/use-cases/register-business'
import { registerUser } from '../src/application/use-cases/register-user'
import { grantBusinessAccess } from '../src/application/use-cases/grant-business-access'
import { businessId, userId } from '../src/domain/shared/ids'
import { userActor } from '../src/domain/facts/actor'
import { closeDb } from '../src/infrastructure/db/client'
import { createAppDependencies } from '../src/infrastructure/container'

config({ path: '.env', quiet: true })

/**
 * Creates one demo business with an owner and an accountant, so the shell has a
 * Libro de Hechos to render. Everything goes through the use cases: the seed has
 * no privileged path into the database.
 */
async function main(): Promise<void> {
  const deps = createAppDependencies()

  const owner = await registerUser(deps, {
    user: { email: `duena+${randomUUID().slice(0, 8)}@arkan.test`, displayName: 'Ana Duena' },
    idempotencyKey: randomUUID(),
  })
  const accountant = await registerUser(deps, {
    user: {
      email: `contador+${randomUUID().slice(0, 8)}@arkan.test`,
      displayName: 'Carlos Contador',
    },
    idempotencyKey: randomUUID(),
  })

  const ownerActor = userActor(owner.result.userId, 'Ana Duena')

  const business = await registerBusiness(deps, {
    business: {
      name: 'Negocio de prueba',
      initialBalancePyg: 4_500_000,
      initialBalanceDate: '2026-08-01',
    },
    actor: ownerActor,
    origin: 'SEED',
    idempotencyKey: randomUUID(),
  })

  const id = businessId(business.result.businessId)

  await grantBusinessAccess(deps, {
    businessId: id,
    userId: userId(owner.result.userId),
    role: 'DUENO',
    actor: ownerActor,
    origin: 'SEED',
    idempotencyKey: randomUUID(),
  })

  await grantBusinessAccess(deps, {
    businessId: id,
    userId: userId(accountant.result.userId),
    role: 'CONTADOR',
    actor: ownerActor,
    origin: 'SEED',
    idempotencyKey: randomUUID(),
  })

  console.log(`business id: ${id}`)
  console.log(`ledger:      /negocios/${id}`)
  console.log('set ARKAN_DEMO_BUSINESS_ID in .env to link it from the home page')
  await closeDb()
}

main().catch(async (error: unknown) => {
  console.error(error)
  await closeDb()
  process.exit(1)
})
