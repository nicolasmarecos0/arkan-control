import { eq } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'
import { getDb } from '@/infrastructure/db/client'
import { factLinks, facts } from '@/infrastructure/db/schema'
import { createHarness, seedBusiness } from '../support/harness'

const harness = createHarness()
const { deps } = harness
const db = getDb()

/** The driver wraps the database error; the trigger message is on the cause. */
async function expectRejection(promise: Promise<unknown>, pattern: RegExp): Promise<void> {
  let raised: unknown
  try {
    await promise
  } catch (error) {
    raised = error
  }
  expect(raised, 'the query was expected to fail').toBeDefined()
  const cause = (raised as { cause?: { message?: string } }).cause
  const message = cause?.message ?? (raised as Error).message
  expect(message).toMatch(pattern)
}

describe('no hard delete', () => {
  it('refuses to delete a fact', async () => {
    const business = await seedBusiness(deps)
    await expectRejection(db.delete(facts).where(eq(facts.id, business.factId)), /append-only/)
    const activity = await deps.facts.recentActivity(business.id)
    expect(activity.facts.map((fact) => fact.id)).toEqual([business.factId])
  })

  it('refuses to rewrite a fact', async () => {
    const business = await seedBusiness(deps)
    await expectRejection(
      db.update(facts).set({ summary: 'otra cosa' }).where(eq(facts.id, business.factId)),
      /append-only/,
    )
    const fact = (await deps.facts.recentActivity(business.id)).facts[0]!
    expect(fact.summary).not.toBe('otra cosa')
  })

  it('refuses to delete the links that give a fact its contexts', async () => {
    const business = await seedBusiness(deps)
    await expectRejection(
      db.delete(factLinks).where(eq(factLinks.factId, business.factId)),
      /append-only/,
    )
    const history = await deps.facts.entityHistory(business.id, {
      entityType: 'NEGOCIO',
      entityId: business.id,
    })
    expect(history.facts).toHaveLength(1)
  })
})
